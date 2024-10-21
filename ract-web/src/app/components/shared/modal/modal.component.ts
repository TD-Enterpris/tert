import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  countdown: number = 120; // 2 minutes countdown
  private intervalId: any; // To hold the interval ID for the countdown

  @Output() continueSessionEvent = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>(); // Only emits event now

  constructor() {}

  // Start the countdown when the modal is displayed
  startCountdown() {
    this.clearCountdown(); // Clear any existing countdown

    this.intervalId = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.intervalId);
        this.logout(); // Emit logout when countdown ends
      }
    }, 1000);
  }

  // Clear the countdown timer
  clearCountdown() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Emit the logout event instead of calling the API directly
  logout() {
    console.log('Emitting logout event from modal...');
    this.logoutEvent.emit(); // Emit the logout event
  }

  // Trigger session continuation
  continueSession() {
    this.clearCountdown(); // Clear countdown on session continuation
    this.continueSessionEvent.emit(); // Emit the continue session event
  }
}
