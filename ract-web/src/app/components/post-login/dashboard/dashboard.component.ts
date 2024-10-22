import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';  // Import AuthService
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  isGaGroup: boolean = false;
  isAdminGroup: boolean = false;
  sessionSubscription: Subscription | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to the session data from the AuthService
    this.sessionSubscription = this.authService.getSession().subscribe(session => {
      if (session && session.currentRole) {
        this.updateRoleView(session.currentRole);  // Update the view based on the current role
      }
    });
  }

  // Method to update the view based on the active role
  updateRoleView(role: string): void {
    this.isGaGroup = role === 'PDI-RACT-GA';
    this.isAdminGroup = role === 'PDI-RACT-ADMIN';
    console.log(`Current Role: ${role}`);

    // Call the updateUrl to ensure routing is updated based on the role
    this.updateUrl(role);
  }

  // Method to update the URL based on the current role
  updateUrl(role: string): void {
    if (role === 'PDI-RACT-GA') {
      this.router.navigate(['/search-results'], { replaceUrl: true });
    } else if (role === 'PDI-RACT-ADMIN') {
      this.router.navigate(['/config'], { replaceUrl: true });
    } else {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }

  // Clean up subscription when the component is destroyed
  ngOnDestroy(): void {
    if (this.sessionSubscription) {
      this.sessionSubscription.unsubscribe();
    }
  }
}
