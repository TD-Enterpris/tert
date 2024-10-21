import { Component, AfterViewInit, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ModalComponent } from './components/shared/modal/modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  idleTime: number = 0;
  idleLimit: number = 15 * 60 * 1000; // 15 minutes idle time
  warningTime: number = 1 * 60 * 1000; // 1 minute warning before showing modal
  private modalVisible: boolean = false; // Track if the modal is already open
  private modalRef: any = null; // To store the reference of the currently open modal

  constructor(private modalService: NgbModal, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Validate session on app start
    this.authService.validateSessionOnLoad().subscribe(isValid => {
      if (!isValid) {
        this.router.navigate(['/login']); // If session is invalid, redirect to login
      }
    });

    // Add event listeners to detect user activity
    window.addEventListener('mousemove', () => this.resetIdleTimer());
    window.addEventListener('keypress', () => this.resetIdleTimer());
    window.addEventListener('click', () => this.resetIdleTimer());
  }

  ngAfterViewInit() {
    this.resetIdleTimer(); // Start the idle timer after view initialization
  }

  // Reset the idle timer when the user is active, but don't close the modal when it's open
  resetIdleTimer() {
    if (!this.modalVisible) {
      clearTimeout(this.idleTime); // Clear the existing timeout if modal is not visible

      // Restart the idle timer
      this.idleTime = window.setTimeout(() => {
        this.showIdleWarning();
      }, this.idleLimit - this.warningTime);  // Trigger idle warning slightly before actual idle limit
    }
  }

  // Trigger the modal when the user is idle
  showIdleWarning() {
    if (!this.modalVisible) { // Check if the modal is already open
      console.log('User has been idle. Showing modal.');

      this.modalRef = this.modalService.open(ModalComponent, { centered: true, backdrop: 'static', keyboard: false });
      this.modalRef.componentInstance.startCountdown(); // Start the countdown

      // Subscribe to modal's continueSession and logout events
      this.modalRef.componentInstance.continueSessionEvent.subscribe(() => {
        this.continueSession(); // Reset idle timer when the user continues
        this.modalRef.close(); // Close the modal
      });

      this.modalRef.componentInstance.logoutEvent.subscribe(() => {
        this.logout(); // Logout when the user triggers logout
      });

      this.modalVisible = true; // Mark modal as visible
      this.modalRef.result.finally(() => {
        this.modalVisible = false; // Reset modal visibility flag when modal is closed
        this.modalRef = null; // Clear the modal reference
      });
    } else {
      console.log('Modal is already visible. Ignoring new modal trigger.');
    }
  }

  // Handle session continuation
  continueSession() {
    this.resetIdleTimer(); // Reset the idle timer if the user continues
    if (this.modalRef) {
      this.modalRef.close(); // Ensure modal is closed
    }

    // Optionally revalidate the session when the user continues
    this.authService.validateSessionOnLoad().subscribe(isValid => {
      if (!isValid) {
        this.router.navigate(['/login']);  // Redirect to login if session is invalid
      }
    });
  }

  // Handle logout
  logout() {
    this.authService.logout().subscribe(() => {
      if (this.modalRef) {
        this.modalRef.close(); // Ensure modal is closed after logout
      }
      this.router.navigate(['/login']); // Redirect to login after logout
    });
  }
}
