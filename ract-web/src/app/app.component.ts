import { Component, AfterViewInit, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './components/shared/modal/modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit {
  idleTime: number = 0;
  idleLimit: number = 2 * 60 * 1000; // 1 minute idle time
  warningTime: number = 1 * 60 * 1000; // 1 minute warning before showing modal
  private modalVisible: boolean = false;
  private modalRef: any = null;

  constructor(private authService: AuthService, private router: Router, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Subscribe to the session state from the AuthService
    this.authService.validateSessionOnLoad().subscribe(isValid => {
      if (isValid) {
        console.log('Session is valid.');
        this.redirectBasedOnRole();  // Call function to redirect based on role
        this.resetIdleTimer();  // Start the idle timer if session is valid
      } else {
        console.log('Session is invalid or not found.');
        this.router.navigate(['/login']);  // Redirect to login if session is invalid
      }
    });

    // Add event listeners to reset idle timer on user activity
    window.addEventListener('mousemove', () => this.resetIdleTimer());
    window.addEventListener('keypress', () => this.resetIdleTimer());
    window.addEventListener('click', () => this.resetIdleTimer());
  }

  ngAfterViewInit() {
    this.resetIdleTimer();  // Start the idle timer after view initialization
  }

  // Function to reset the idle timer
  resetIdleTimer(): void {
    if (!this.modalVisible) {
      clearTimeout(this.idleTime);  // Clear the existing timeout if modal is not visible

      // Restart the idle timer
      this.idleTime = window.setTimeout(() => {
        this.showIdleWarning();  // Show the idle warning modal after idleLimit - warningTime
      }, this.idleLimit - this.warningTime);
    }
  }

  // Function to show the idle timeout warning modal
  showIdleWarning(): void {
    if (!this.modalVisible) {
      console.log('User has been idle. Showing modal.');
      this.modalRef = this.modalService.open(ModalComponent, { centered: true, backdrop: 'static', keyboard: false });
      this.modalRef.componentInstance.startCountdown();  // Start the countdown in the modal

      // Subscribe to the modal's continueSession and logout events
      this.modalRef.componentInstance.continueSessionEvent.subscribe(() => {
        this.continueSession();
        this.modalRef.close();
      });

      this.modalRef.componentInstance.logoutEvent.subscribe(() => {
        this.logout();
      });

      this.modalVisible = true;
      this.modalRef.result.finally(() => {
        this.modalVisible = false;
        this.modalRef = null;
      });
    }
  }

  // Function to continue the session after idle warning
  continueSession(): void {
    this.resetIdleTimer();  // Reset the idle timer
    if (this.modalRef) {
      this.modalRef.close();  // Close the modal
    }

    // Optionally, you can revalidate the session
    this.authService.validateSessionOnLoad().subscribe(isValid => {
      if (!isValid) {
        this.router.navigate(['/login']);  // Redirect to login if session is invalid
      }
    });
  }

  // Function to handle logout
  logout(): void {
    this.authService.logout();  // No need to subscribe, just call the method
    if (this.modalRef) {
      this.modalRef.close();  // Close the modal
    }
    this.router.navigate(['/login']);  // Redirect to login after logout
  }
  

  // Function to redirect based on the user’s role
  redirectBasedOnRole(): void {
    this.authService.getSession().subscribe(session => {
      if (session && session.currentRole) {
        if (session.currentRole === 'PDI-RACT-GA') {
          this.router.navigate(['/search-results']);  // Redirect to search-results page
        } else if (session.currentRole === 'PDI-RACT-ADMIN') {
          this.router.navigate(['/config']);  // Redirect to config page
        } else {
          this.router.navigate(['/']);  // If no role matches, redirect to the home or default page
        }
      }
    });
  }
}
