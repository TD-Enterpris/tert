import { Component, Input } from '@angular/core';
import { NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-demographic-info',
  templateUrl: './demographic-info.component.html',
  styleUrls: ['./demographic-info.component.css']
})
export class DemographicInfoComponent {
  @Input() offcanvasRef!: NgbOffcanvasRef;  // Using Input decorator to get the offcanvasRef

  // Method to close the offcanvas
  close(): void {
    if (this.offcanvasRef) {
      this.offcanvasRef.close();
    }
  }
}
