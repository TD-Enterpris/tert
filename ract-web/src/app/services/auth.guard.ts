import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { switchMap, delay, map } from 'rxjs/operators';  // Add switchMap and delay

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    // If the initiate API is still in progress, block the validation call
    if (this.authService.isInitiateInProgress()) {
      console.log('Session initiation is in progress, blocking validation call.');
      return of(false);  // Prevent validation until the session is fully initiated
    }

    // Add a short grace period after session initiation to prevent immediate revalidation
    return of(true).pipe(
      delay(500),  // Add delay (in milliseconds) to give some time before validation
      switchMap(() => {
        // Check if the session is already initialized
        if (this.authService.isSessionInitialized()) {
          console.log('Session is valid, access allowed.');
          return of(true);  // Allow access if the session is already initialized
        }

        // Call validateSessionOnLoad if the session is not initialized
        return this.authService.validateSessionOnLoad().pipe(
          map(isValid => {
            if (isValid) {
              console.log('Session is valid, access allowed.');
              return true;  // Allow access if the session is valid
            } else {
              console.log('Session invalid, redirecting to SSO.');
              this.authService.redirectToSSO();  // Redirect to SSO if session is invalid
              return false;  // Block access if session is invalid
            }
          })
        );
      })
    );
  }
}
