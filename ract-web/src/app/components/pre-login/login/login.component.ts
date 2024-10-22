import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';  // Import AuthService
import { environment } from '../../../../environments/environment';  // Import environment to get API URL

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private sessionInitiated = false;  // Add flag to prevent duplicate calls
  public isLoading = false;  // Add flag to track loading state
  public validateBlocked = true;  // Block validation initially

  constructor(
    private route: ActivatedRoute, 
    private http: HttpClient, 
    private router: Router,
    private authService: AuthService  // Inject AuthService
  ) {}

  ngOnInit(): void {
    // Capture the authorization code from the URL
    this.route.queryParams.subscribe(params => {
      const code = params['code'];  // Capture the 'code' query parameter
      if (code && !this.sessionInitiated) {  // Prevent duplicate session initiation
        console.log('Authorization code captured:', code);
        this.sessionInitiated = true;  // Set flag to true to prevent re-initiation
        this.isLoading = true;  // Set loading state to true

        // Inform AuthService that validation should be blocked
        this.authService.setValidationBlocked(true);

        // Call the initiate API with the captured code before clearing the URL
        this.callInitiateSessionApi(code);
      } else if (!code) {
        console.log('No authorization code found in the URL.');
        this.authService.setValidationBlocked(false);  // Inform AuthService that validation can proceed
        this.authService.redirectToSSO();  // Redirect to SSO if no authorization code
      }
    });
  }

  // Method to call the initiate API with the captured authorization code
  callInitiateSessionApi(code: string): void {
    const apiUrl = `${environment.oauth.baseUrl}${environment.oauth.initiateSessionUrl}`;  // Get initiate session URL from environment
    const body = { code };  // Send the authorization code in the body

    console.log('Sending authorization code to initiate API:', code);

    // Call the initiate session API
    this.http.post<any>(apiUrl, body).subscribe(
      (response) => {
        console.log('Session initiated successfully:', response);

        // Store the entire session response in memory using AuthService
        this.authService.initiateSession(response);  // Use initiateSession from AuthService

        console.log('Session data stored in AuthService.');

        // Now clear the authorization code from the URL to prevent reprocessing
        this.clearAuthorizationCodeFromUrl();

        // Unblock validation after the session is initiated
        this.authService.setValidationBlocked(false);

        // Redirect based on TD_memberOf
        this.handleGroupRedirection(response.TD_memberOf);
        this.isLoading = false;  // Turn off the spinner after successful response
      },
      (error) => {
        console.error('Error initiating session:', error);
        this.sessionInitiated = false;  // Reset flag if initiation failed
        this.isLoading = false;  // Turn off the spinner in case of error
        this.authService.setValidationBlocked(false);  // Unblock validation to allow retry
        this.authService.redirectToSSO();  // Redirect to SSO if initiation failed
      }
    );
  }

  // Method to clear authorization code from URL
  clearAuthorizationCodeFromUrl(): void {
    console.log('Clearing authorization code from the URL.');
    this.router.navigate([], {
      replaceUrl: true,
      queryParams: { code: null },  // Remove 'code' from URL
      queryParamsHandling: 'merge'
    });
  }

  // Method to handle redirection based on TD_memberOf
  handleGroupRedirection(groups: string[]): void {
    if (groups.length === 0) {
      console.log('No roles assigned.');
      return;
    }

    const currentRole = groups[0];  // Take the first role as the current role
    console.log('Current Role:', currentRole);

    if (currentRole === 'PDI-RACT-GA') {
      console.log('Redirecting to search-results page...');
      this.router.navigate(['/search-results'], { replaceUrl: true });  // Redirect to search-results and replace URL
    } else if (currentRole === 'PDI-RACT-ADMIN') {
      console.log('Redirecting to config-table page...');
      this.router.navigate(['/config-table'], { replaceUrl: true });  // Redirect to config and replace URL
    } else {
      console.log('Unrecognized role, staying on login.');
    }
  }
}
