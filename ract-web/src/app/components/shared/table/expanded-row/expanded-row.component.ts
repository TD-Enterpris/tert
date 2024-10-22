import { Component } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { DemographicInfoComponent } from '../../../post-login/demographic-info/demographic-info.component';
import { EmailCommunicationComponent } from '../../../post-login/email-communication/email-communication.component';

@Component({
  selector: 'app-expanded-row',
  templateUrl: './expanded-row.component.html',
  styleUrls: ['./expanded-row.component.css']
})
export class ExpandedRowComponent {

  constructor(private offcanvasService: NgbOffcanvas) {}

  // Method to open the offcanvas based on type (demographic or email)
  openOffcanvas(type: string): void {
    let offcanvasRef: NgbOffcanvasRef | null = null; // Initialize as null

    if (type === 'demographic') {
      // Open the offcanvas and assign it to the variable
      offcanvasRef = this.offcanvasService.open(DemographicInfoComponent, { 
        ariaLabelledBy: 'Demographic Info',
        position: 'end',
        panelClass: 'custom-offcanvas',  // Specify the position ('start', 'end', 'top', 'bottom')
      });
    } else if (type === 'email') {
      // Open the offcanvas and assign it to the variable
      offcanvasRef = this.offcanvasService.open(EmailCommunicationComponent, { 
        ariaLabelledBy: 'Email Communication',
        position: 'end',
      });
    }

    // Check if offcanvasRef exists, then pass it to the component instance
    if (offcanvasRef) {
      offcanvasRef.componentInstance.offcanvasRef = offcanvasRef;
    }
  }
}
