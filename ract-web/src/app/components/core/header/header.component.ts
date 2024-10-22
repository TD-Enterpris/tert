import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth.service';  // Import the AuthService
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  currentRole: string | null = null;  // Ensure currentRole is either string or null
  inactiveRole: string | null = null;  // Ensure inactiveRole is either string or null
  userId: string | null = null;  // Ensure userId is either string or null
  sessionSubscription: Subscription | null = null;  // Subscription to session data
  showToggleButton: boolean = false;  // Toggle visibility of the role switch button

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to the complete session data from the AuthService
    this.sessionSubscription = this.authService.getSession().subscribe(session => {
      if (session) {
        this.userId = session.userId ?? null;  // Fallback to null if undefined
        this.currentRole = session.currentRole ?? null;  // Fallback to null if undefined
        this.inactiveRole = session.inactiveRoles && session.inactiveRoles[0] ? session.inactiveRoles[0] : null;  // Fallback to null if undefined

        // Display role switch button only if both roles are available
        this.showToggleButton = !!this.currentRole && !!this.inactiveRole;

        // Update the view based on the role
        this.updateRoleView(this.currentRole);
      }
    });
  }

    // Method to handle logout
    logout(): void {
      this.authService.logout();  // Call the logout method from AuthService
    }

  // Method to toggle roles
  toggleRole(): void {
    if (this.currentRole && this.inactiveRole) {
      // Swap current and inactive roles
      const tempRole = this.currentRole;
      this.currentRole = this.inactiveRole;
      this.inactiveRole = tempRole;

      // Inform AuthService to update the roles
      this.authService.updateRoles(this.currentRole, this.inactiveRole);

      // Navigate to the appropriate route based on the new current role
      const route = this.currentRole === 'PDI-RACT-GA' ? '/search-results' : '/config';
      this.router.navigate([route]);
    }
  }

  // Method to update the view based on the active role
  updateRoleView(role: string | null): void {
    // Add logic here if needed to update UI based on the current role
  }

  // Unsubscribe from session data when component is destroyed
  ngOnDestroy(): void {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }
}
