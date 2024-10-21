import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  // Method to check if the route can be activated based on session validation
  canActivate(): Observable<boolean> {
    return this.authService.validateSessionOnLoad().pipe(
      map((sessionValid: boolean) => {
        if (sessionValid) {
          // If session is valid, allow access to the route
          return true;
        } else {
          // If session is invalid, redirect to the login page
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error during session validation:', error);
        // On error, redirect to login and deny access
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
