import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';  // Import AuthService

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isGaGroup: boolean = false;
  isAdminGroup: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to role changes from the AuthService
    this.authService.currentRole$.subscribe(role => {
      if (role) {
        this.updateRoleView(role);
        this.updateUrl(role);  // Ensure URL updates based on role
      }
    });

    // Load the initial role from AuthService
    const initialRole = this.authService.getCurrentRole();
    if (initialRole) {
      this.updateRoleView(initialRole);
      this.updateUrl(initialRole);  // Ensure URL is correct on load
    }
  }

  // Method to update the view based on the active role
  updateRoleView(role: string): void {
    this.isGaGroup = role === 'PDI-RACT-GA';
    this.isAdminGroup = role === 'PDI-RACT-ADMIN';
    console.log(`Current Role: ${role}`);
  }

  // Method to update the URL based on the current role
  updateUrl(role: string): void {
    if (role === 'PDI-RACT-GA') {
      this.router.navigate(['/dashboard/search-results'], { replaceUrl: true });
    } else if (role === 'PDI-RACT-ADMIN') {
      this.router.navigate(['/dashboard/config'], { replaceUrl: true });
    } else {
      this.router.navigate(['/dashboard'], { replaceUrl: true });
    }
  }
}
