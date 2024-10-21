import { Component, Input } from '@angular/core';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { DemographicInfoComponent } from '../../../post-login/demographic-info/demographic-info.component';
import { EmailCommunicationComponent } from '../../../post-login/email-communication/email-communication.component';

@Component({
  selector: 'app-expanded-row',
  templateUrl: './expanded-row.component.html',
  styleUrls: ['./expanded-row.component.css']
})
export class ExpandedRowComponent {

  // Input property to receive account data from the parent component
  @Input() account: any;

  constructor(private offcanvasService: NgbOffcanvas) {}

  // Method to open the offcanvas based on type (demographic or email)
  openOffcanvas(type: string): void {
    let offcanvasRef: NgbOffcanvasRef | null = null; // Initialize as null

    if (type === 'demographic') {
      offcanvasRef = this.offcanvasService.open(DemographicInfoComponent, { 
        ariaLabelledBy: 'Demographic Info',
        position: 'end',
        panelClass: 'custom-offcanvas',  // Specify the position ('start', 'end', 'top', 'bottom')
      });
    } else if (type === 'email') {
      offcanvasRef = this.offcanvasService.open(EmailCommunicationComponent, { 
        ariaLabelledBy: 'Email Communication',
        position: 'end',
      });
    }

    if (offcanvasRef) {
      offcanvasRef.componentInstance.offcanvasRef = offcanvasRef;
    }
  }
}
