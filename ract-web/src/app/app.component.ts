import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from './components/shared/modal/modal.component';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnInit, OnDestroy {
  idleTime: number = 0;
  idleLimit: number = 2 * 60 * 1000; // 2 minutes idle time
  warningTime: number = 1 * 60 * 1000; // 1 minute warning before showing modal
  private modalVisible: boolean = false;
  private modalRef: any = null;

  // Initialize the subscriptions to null
  private mouseMoveSub: Subscription | null = null;
  private keyPressSub: Subscription | null = null;
  private clickSub: Subscription | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private route: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // Check if there's a 'code' parameter in the URL
    this.route.queryParams.subscribe(params => {
      const authCode = params['code'];

      if (authCode) {
        // If the code exists, block validation and redirect to login to handle the initiate API
        console.log('Authorization code found. Blocking validation and redirecting to login.');
        this.authService.setValidationBlocked(true);  // Block validation
        this.router.navigate(['/login'], { queryParams: { code: authCode } });
      } else {
        // If no code is found, proceed with session validation
        this.authService.setValidationBlocked(false);  // Unblock validation
      }
    });

    // Add throttled event listeners to reset idle timer on user activity
    this.mouseMoveSub = fromEvent(window, 'mousemove').pipe(throttleTime(500)).subscribe(() => this.resetIdleTimer());
    this.keyPressSub = fromEvent(window, 'keypress').pipe(throttleTime(500)).subscribe(() => this.resetIdleTimer());
    this.clickSub = fromEvent(window, 'click').pipe(throttleTime(500)).subscribe(() => this.resetIdleTimer());
  }

  ngAfterViewInit() {
    this.resetIdleTimer();  // Start the idle timer after view initialization
  }

  ngOnDestroy(): void {
    // Unsubscribe from event listeners to prevent memory leaks
    if (this.mouseMoveSub) this.mouseMoveSub.unsubscribe();
    if (this.keyPressSub) this.keyPressSub.unsubscribe();
    if (this.clickSub) this.clickSub.unsubscribe();
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
        this.authService.redirectToSSO();  // Redirect to SSO if session is invalid
      }
    });
  }

  // Function to handle logout
  logout(): void {
    this.authService.logout();  // No need to subscribe, just call the method
    if (this.modalRef) {
      this.modalRef.close();  // Close the modal
    }
    this.authService.redirectToSSO();  // Redirect to SSO after logout
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
