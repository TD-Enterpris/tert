import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  isLoading: boolean = false;
  errorMessage: string = '';
  apiCallMade: boolean = false;  // Flag to prevent multiple API calls

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Avoid making API calls multiple times
    if (!this.apiCallMade) {
      this.route.queryParams.subscribe(params => {
        const code = params['code'];

        // Ensure the code exists and API call has not been made
        if (code && !this.apiCallMade) {
          this.apiCallMade = true;  // Mark API call as made

          console.log('Authorization code found:', code);
          this.isLoading = true;

          // Exchange authorization code for session details
          this.authService.exchangeAuthorizationCode(code).subscribe(
            response => {
              // Store session details securely in memory using AuthService
              this.authService.setSession(response);

              // Handle redirection based on `TD_memberOf`
              this.handleGroupRedirection(response.TD_memberOf);
              this.isLoading = false;
            },
            error => {
              console.error('Error exchanging authorization code:', error);
              this.isLoading = false;
              this.apiCallMade = false;  // Reset the flag on error
              this.errorMessage = 'An error occurred during the login process. Please try again.';
            }
          );
        } else if (!environment.production && !this.apiCallMade) {
          // Simulate the redirection in local mode
          console.log('Running in local mode. Simulating authorization code.');
          this.simulateLocalAuthorizationCode();
        } else {
          // If no code and it's production, handle real SSO redirect
          if (!code && environment.production) {
            console.error('Authorization code not found in URL. Redirecting to SSO login...');
          }
        }
      });
    }
  }

  // Simulate the authorization code in local without refreshing the page
  simulateLocalAuthorizationCode(): void {
    const mockCode = 'FezvA4LdmJZQV-sEilV2ZGmgCVQMqkcr1okAAAAC';
    console.log('Simulating local authorization code:', mockCode);

    // Simulate redirection without page reload
    this.router.navigate([], {
      queryParams: { code: mockCode },
      queryParamsHandling: 'merge',
    });
  }

  // Method to handle redirection based on TD_memberOf
  handleGroupRedirection(groups: string[]): void {
    if (groups.length === 0) {
      // No groups, redirect to login
      this.router.navigate(['/login']);
    } else if (groups.length === 1) {
      // Only one group, redirect accordingly
      if (groups[0] === 'PDI-RACT-GA') {
        this.router.navigate(['/dashboard/search-results']);
      } else if (groups[0] === 'PDI-RACT-ADMIN') {
        this.router.navigate(['/dashboard/config']);
      }
      // Store the current role in memory
      this.authService.setCurrentRole(groups[0]);
    } else {
      // Multiple groups, use the first group for initial redirection
      const firstGroup = groups[0];
      this.authService.setCurrentRole(firstGroup);
      if (firstGroup === 'PDI-RACT-GA') {
        this.router.navigate(['/dashboard/search-results']);
      } else if (firstGroup === 'PDI-RACT-ADMIN') {
        this.router.navigate(['/dashboard/config']);
      }
    }
  }
}
