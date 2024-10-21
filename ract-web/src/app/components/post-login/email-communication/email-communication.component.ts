import { Component } from '@angular/core';
import { NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-email-communication',
  templateUrl: './email-communication.component.html',
  styleUrls: ['./email-communication.component.css']
})
export class EmailCommunicationComponent {
  // Add this property to store the reference to the Offcanvas
  offcanvasRef!: NgbOffcanvasRef;

  // Method to close the offcanvas
  close(): void {
    if (this.offcanvasRef) {
      this.offcanvasRef.close();
    }
  }
}
