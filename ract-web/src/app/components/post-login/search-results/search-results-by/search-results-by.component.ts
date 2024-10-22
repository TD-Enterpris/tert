import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-search-results-by',
  templateUrl: './search-results-by.component.html',
  styleUrls: ['./search-results-by.component.css']
})
export class SearchResultsByComponent {
  applicationNumber: string = '';
  accountNumber: string = '';
  fromDate: string = '';
  toDate: string = '';
  errorMessage: string = '';

  @Output() searchCriteria = new EventEmitter<any>();

  // Search function to handle search criteria
  search() {
    const filledFields = [this.applicationNumber, this.accountNumber, this.fromDate, this.toDate].filter(Boolean).length;

    // Ensure only one field is filled
    if (filledFields > 1) {
      this.errorMessage = 'Please fill only one field to search.'; // Error when multiple fields are filled
      return;
    }

    this.errorMessage = '';  // Clear any existing error message

    const criteria: any = {};
    if (this.applicationNumber) {
      criteria.applicationNumber = this.applicationNumber;
    }
    if (this.accountNumber) {
      criteria.accountNumber = this.accountNumber;
    }
    if (this.fromDate || this.toDate) {
      criteria.dateRange = { fromDate: this.fromDate, toDate: this.toDate }; // Combine date range
    }

    // Emit the criteria for the table or other components
    console.log('Emitting search criteria:', criteria);
    this.searchCriteria.emit(criteria);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow numbers only (48-57 are ASCII codes for 0-9)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  // Clear function to reset all fields
  clear() {
    this.applicationNumber = '';
    this.accountNumber = '';
    this.fromDate = '';
    this.toDate = '';
    this.errorMessage = '';
    console.log('Clearing search criteria');
    this.searchCriteria.emit({});  // Emit empty object to clear search results
  }
}
