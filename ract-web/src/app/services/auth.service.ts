import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';  // Import environment configuration

interface SessionData {
  userId: string;
  TD_memberOf: string[];
  currentRole?: string;  // Active role (existing)
  inactiveRoles?: string[];  // Inactive roles (existing)
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // URLs now fetched from environment configuration
  private validateSessionUrl = `${environment.oauth.baseUrl}${environment.oauth.validateSessionUrl}`;  // API URL for session validation
  private logoutUrl = `${environment.oauth.baseUrl}${environment.oauth.logoutUrl}`;  // API URL for logout
  private ssoLoginUrl = `${environment.sso.baseUrl}?client_id=${environment.sso.clientId}&response_type=${environment.sso.responseType}&redirect_uri=${environment.sso.redirectUri}&scope=${environment.sso.scope}`;

  private isSessionActive = false;  // Track if session is active
  private callInProgress = false;  // Prevent duplicate API calls
  private initiateInProgress = false;  // Track if initiate API is in progress
  private validationBlocked = new BehaviorSubject<boolean>(false);  // Default to not blocked
  public validationBlocked$: Observable<boolean> = this.validationBlocked.asObservable();  // Expose the observable

  // Method to block or unblock validation
  setValidationBlocked(isBlocked: boolean): void {
    this.validationBlocked.next(isBlocked);  // Set whether validation is blocked
  }

  // BehaviorSubject to store the session data and make it accessible across the app
  private sessionSubject = new BehaviorSubject<SessionData | null>(null);
  public session$ = this.sessionSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // Method to check if session is initialized
  public isSessionInitialized(): boolean {
    return this.isSessionActive;  // Return whether the session is active
  }

  // Check if initiate API is in progress
  public isInitiateInProgress(): boolean {
    return this.initiateInProgress;  // Return if initiate is in progress
  }

  // Method to check if session is already stored in memory
  private isSessionStored(): boolean {
    return this.isSessionActive && this.sessionSubject.getValue() !== null;
  }

  // Method to store session details after successful initiation or validation
  private storeSessionDetails(sessionData: SessionData): void {
    this.isSessionActive = true;  // Mark session as active
    this.initiateInProgress = false;  // Mark initiate as complete
    this.sessionSubject.next(sessionData);  // Update the session BehaviorSubject
    console.log('Stored session details:', sessionData);
  }

  // Method to handle session validation on page load/refresh
  validateSessionOnLoad(): Observable<boolean> {
    // If initiate API is in progress, stop the validate API call
    if (this.isInitiateInProgress()) {
      console.log('Initiate API is in progress, blocking validation.');
      return of(false);  // Block validation if initiate is in progress
    }

    // Check if the session is already stored in memory
    if (this.isSessionStored()) {
      console.log('Session already in memory, skipping validate API call.');
      return of(true);  // Session is valid
    }

    // Prevent multiple validate calls by checking if one is in progress
    if (this.callInProgress) {
      console.log('Session validation already in progress, skipping duplicate call.');
      return this.sessionSubject.pipe(map(session => !!session));  // Return current session state
    }

    this.callInProgress = true;  // Set call in progress

    return this.http.get<any>(this.validateSessionUrl, { withCredentials: true }).pipe(
      map(response => {
        this.callInProgress = false;  // Reset in-progress flag

        if (!response.userid) {
          console.error('Error: `userid` not found in the response');
          this.redirectToSSO();  // Ensure this redirection only happens when session validation fails
          return false;
        }

        const currentRole = response.TD_memberOf[0];  // Active role is the first one in TD_memberOf
        const inactiveRoles = response.TD_memberOf.slice(1);  // Remaining roles as inactive

        const transformedResponse: SessionData = {
          userId: response.userid,
          TD_memberOf: response.TD_memberOf,
          currentRole: currentRole,  // Set current active role
          inactiveRoles: inactiveRoles  // Set inactive roles
        };

        this.storeSessionDetails(transformedResponse);  // Store session details
        return true;
      }),
      catchError(error => {
        this.callInProgress = false;  // Reset the call in progress flag on error
        console.error('Session validation failed:', error);
        this.redirectToSSO();  // Redirect to SSO on validation failure
        return of(false);
      })
    );
  }

  // Logout Method
  logout(): void {
    this.http.post(this.logoutUrl, {}).subscribe(
      () => {
        console.log('Logout successful');
        this.resetSession();  // Reset session in AuthService
        this.router.navigate(['/login'], { replaceUrl: true });  // Redirect to login page
      },
      (error) => {
        console.error('Error during logout:', error);
      }
    );
  }

  // Method to initiate the session from the login process
  initiateSession(sessionData: any): void {
    console.log('Initiating session:', sessionData);

    // Prevent multiple initiate calls if one is in progress
    if (this.initiateInProgress) {
      console.log('Session initiation already in progress, skipping duplicate call.');
      return;
    }

    this.initiateInProgress = true;  // Set initiate call in progress

    const currentRole = sessionData.TD_memberOf[0];  // Active role is the first one in TD_memberOf
    const inactiveRoles = sessionData.TD_memberOf.slice(1);  // Remaining roles as inactive

    const transformedSessionData: SessionData = {
      userId: sessionData.userid,  // Transform 'userid' from the response to 'userId'
      TD_memberOf: sessionData.TD_memberOf,
      currentRole: currentRole,  // Set current active role
      inactiveRoles: inactiveRoles  // Set inactive roles
    };

    this.storeSessionDetails(transformedSessionData);  // Store session details
    this.callInProgress = false;  // Reset in-progress flag after initiation is done
    this.initiateInProgress = false;  // Mark initiate call as done
  }

  // Method to update roles (active and inactive roles) in the session
  updateRoles(currentRole: string, inactiveRole: string): void {
    const session = this.sessionSubject.getValue();
    if (session) {
      const updatedSession = { ...session, currentRole, inactiveRoles: [inactiveRole] };
      this.sessionSubject.next(updatedSession);
      console.log(`Roles updated. Current Role: ${currentRole}, Inactive Role: ${inactiveRole}`);
    }
  }

  // Method to redirect to the SSO login page if no valid session is found
  public redirectToSSO(): void {  // Change from private to public
    console.log('Redirecting to SSO login page.');
    window.location.href = this.ssoLoginUrl;  // Redirect to the SSO login page
  }

  // Method to reset the session (useful for logout or invalid session scenarios)
  resetSession(): void {
    console.log('Resetting session...');
    this.isSessionActive = false;
    this.callInProgress = false;
    this.initiateInProgress = false;  // Reset initiate flag
    this.sessionSubject.next(null);  // Reset the session in memory
  }

  // Expose the current session data as an observable to other components
  getSession(): Observable<SessionData | null> {
    return this.session$;
  }
}
