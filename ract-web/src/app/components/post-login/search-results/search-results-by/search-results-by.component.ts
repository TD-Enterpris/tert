import { Component, EventEmitter, Output } from '@angular/core';
import { SearchResultsDataService } from '../../../../services/search-results-data.service';

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

  constructor(private searchResultsDataService: SearchResultsDataService) {}

  // Search function to handle search criteria
  search() {
    const filledFields = [this.applicationNumber, this.accountNumber, this.fromDate, this.toDate].filter(Boolean).length;

    if (filledFields > 1) {
      this.errorMessage = 'Please fill only one field to search.';
      return;
    }

    this.errorMessage = '';  // Clear any existing error message

    let searchType = '';  // To track the search type

    // Determine the search type
    if (this.applicationNumber) {
      searchType = 'ApplicationNumber';
    } else if (this.accountNumber) {
      searchType = 'AccountNumber';
    } else if (this.fromDate && this.toDate) {
      searchType = 'DateRange';
    } else {
      this.errorMessage = 'Please fill at least one field to search.';
      return;
    }

    this.filterResults(searchType);  // Filter results based on the search criteria
  }

  // Method to filter results from the JSON data
  filterResults(searchType: string) {
    this.searchResultsDataService.loadDataFromFile().subscribe(
      (data: any) => {
        let filteredResults = data;

        // Filter based on the search type
        if (searchType === 'ApplicationNumber' && this.applicationNumber) {
          filteredResults = data.filter((item: any) =>
            item.loanDetails?.applicationNumber === this.applicationNumber
          );
        } else if (searchType === 'AccountNumber' && this.accountNumber) {
          filteredResults = data.filter((item: any) =>
            item.loanDetails?.accounts?.[0]?.accountNumber === this.accountNumber
          );
        } else if (searchType === 'DateRange' && this.fromDate && this.toDate) {
          filteredResults = data.filter((item: any) => {
            const applicationDate = new Date(item.loanDetails?.applicationDate);
            const fromDate = new Date(this.fromDate);
            const toDate = new Date(this.toDate);
            return applicationDate >= fromDate && applicationDate <= toDate;
          });
        }

        if (filteredResults.length > 0) {
          this.searchResultsDataService.setSearchResults({
            data: filteredResults,
            searchType: searchType
          });
          this.searchCriteria.emit({ data: filteredResults, searchType });
        } else {
          this.errorMessage = 'No results found for the search criteria.';
          this.searchResultsDataService.clearSearchResults();
          this.searchCriteria.emit({});
        }
      },
      (error) => {
        this.errorMessage = `Search failed: ${error.message || 'Please try again later.'}`;
      }
    );
  }

  // Allow only numeric input in certain fields (e.g., account and application number)
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();  // Prevent non-numeric input
    }
  }

  // Clear only the input fields without resetting the search result table
  clear() {
    this.applicationNumber = '';
    this.accountNumber = '';
    this.fromDate = '';
    this.toDate = '';
    this.errorMessage = '';  // Clear any existing error message, but keep the results intact
  }

  // Full reset: clear the form and reset the search results in the table
  clearAll() {
    this.clear();  // Clear input fields and error message
    this.searchResultsDataService.clearSearchResults();  // Clear the search results in the service
    this.searchCriteria.emit({});  // Emit an empty object to signal clearing of results
  }

  // Clear only the error message without affecting input fields or search results
  clearErrorMessage() {
    this.errorMessage = '';  // Remove only the error message
  }
}
