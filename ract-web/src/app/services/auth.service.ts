import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiBaseUrl}/api/session`;  // Base API URL

  // BehaviorSubjects for authentication and role tracking
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentRoleSubject = new BehaviorSubject<string | null>(null);

  private currentUserID: string | null = null;
  private sessionID: string | null = null;
  private accessToken: string | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.validateSessionOnLoad();  // Call validate API on app load
  }

  // Expose observables for authentication status and role
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  get currentRole$(): Observable<string | null> {
    return this.currentRoleSubject.asObservable();
  }

  // Method to check the session on app load/refresh using the validate API
  validateSessionOnLoad(): Observable<boolean> {
    console.log('Stored Session ID:', this.sessionID);
    console.log('Stored Access Token:', this.accessToken);

    // Call the validate API to check if the session is active
    return this.http.get<any>(`${this.apiUrl}/validate`, { withCredentials: true }).pipe(
      map((response) => {
        console.log('Response from validate API:', response);
        if (response && response.sessionID && response.userID) {
          this.isAuthenticatedSubject.next(true);
          this.currentUserID = response.userID;
          this.sessionID = response.sessionID;
          const userRoles = response.TD_memberOf || [];
          if (userRoles.length > 0) {
            this.setCurrentRole(userRoles[0]);  // Set the first role (adjust as needed)
          }
          return true;  // Session is valid
        } else {
          this.handleInvalidSession();  // Handle invalid session
          return false;  // Session is invalid
        }
      }),
      catchError((error) => {
        console.error('Validation API call failed:', error);
        this.handleInvalidSession();  // Handle failure case
        return of(false);  // Return false on error
      })
    );
  }

  // Handle invalid session logic (clear state and redirect to login)
  handleInvalidSession(): void {
    this.isAuthenticatedSubject.next(false);
    this.currentRoleSubject.next(null);
    this.currentUserID = null;
    this.sessionID = null;
    this.accessToken = null;
    this.router.navigate(['/login']);  // Redirect to login page
  }

  // Method to handle authorization code exchange for tokens
  exchangeAuthorizationCode(code: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/initiate`, 
      { code }, 
      { withCredentials: true }  // Include cookies
    ).pipe(
      tap((response) => {
        if (response && response.accessToken) {
          this.accessToken = response.accessToken;  // Store access token
          console.log('Access token received:', this.accessToken);
        }
      }),
      catchError((error) => {
        console.error('Error during authorization code exchange:', error);
        return of(null);  // Handle error case and return null
      })
    );
  }

  // Store session details received from the backend and update state
  setSession(sessionData: any): void {
    if (sessionData && sessionData.sessionID && sessionData.userID && sessionData.TD_memberOf) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserID = sessionData.userID;
      this.sessionID = sessionData.sessionID;
      this.accessToken = sessionData.accessToken || null;

      console.log('Stored Access Token:', this.accessToken);
      console.log('Stored Session ID:', this.sessionID);

      this.setCurrentRole(sessionData.TD_memberOf[0]);
      console.log('Session data stored successfully.');
    } else {
      console.error('Invalid session data received.');
    }
  }

  // Set the current role in memory and optionally in localStorage
  setCurrentRole(role: string): void {
    this.currentRoleSubject.next(role);
    localStorage.setItem('selectedRole', role);  // Optionally store in localStorage
    console.log(`Current role set to: ${role}`);
  }

  // Synchronous getter for current role
  getCurrentRole(): string | null {
    return this.currentRoleSubject.getValue();
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.getValue();
  }

  // Logout method (invalidate session)
  logout(): Observable<any> {
    const headers = this.createAuthHeaders();
  
    return this.http.post<any>(
      `${this.apiUrl}/logout`, 
      {}, 
      { headers, withCredentials: true }
    ).pipe(
      tap((response) => {
        console.log('Logout successful:', response);
        this.clearSession();  // Clear session after logout
      }),
      catchError((error) => {
        console.error('Error during logout:', error);
        return of(null);  // Handle error and return null
      })
    );
  }

  // Helper method to create authorization headers with access token
  private createAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (this.accessToken) {
      headers = headers.set('Authorization', `Bearer ${this.accessToken}`);
    }
    return headers;
  }

  // Clear session data on logout or invalid session
  private clearSession(): void {
    this.isAuthenticatedSubject.next(false);
    this.currentRoleSubject.next(null);
    this.currentUserID = null;
    this.sessionID = null;
    this.accessToken = null;
    this.router.navigate(['/login']);
  }

  // Get the current user ID from memory
  getCurrentUserID(): string | null {
    return this.currentUserID;
  }
}
