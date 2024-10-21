import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { SearchResultsDataService } from '../../../../services/search-results-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-results-table',
  templateUrl: './search-results-table.component.html',
  styleUrls: ['./search-results-table.component.css']
})
export class SearchResultsTableComponent implements OnInit, OnDestroy {
  @Input() searchParams: any;
  tableData: any[] = [];
  heading: string = 'Please enter your search criteria to view results.';
  displayTable: boolean = false;
  
  // Subject for unsubscribing from observables
  private unsubscribe$ = new Subject<void>();

  constructor(private searchResultsDataService: SearchResultsDataService) {}

  ngOnInit(): void {
    // Subscribe to search results from the service (loaded from the local JSON file)
    this.searchResultsDataService.getSearchResults()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: any) => {
        if (result && result.data && result.data.length > 0) {
          this.tableData = result.data;
          this.displayTable = true;
          this.updateHeading(result.searchType);  // Update heading based on search type
        } else if (result && result.data && result.data.length === 0) {
          this.handleNoResults(result.searchType);
        } else {
          this.heading = 'Please enter your search criteria to view results.';
          this.displayTable = false;
        }
      }, (error) => {
        this.handleError(error);  // Handle errors during data fetching
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // Method to update heading based on search type
  updateHeading(searchType: string): void {
    if (searchType === 'ApplicationNumber') {
      this.heading = 'Search results by Application Number';
    } else if (searchType === 'AccountNumber') {
      this.heading = 'Search results by Account Number';
    } else if (searchType === 'DateRange') {
      this.heading = 'Search results by Application Date Range';
    } else {
      this.heading = 'Search results';  // Default heading if search type is not recognized
    }
  }

  // Method to handle no results
  handleNoResults(searchType: string): void {
    this.tableData = [];
    this.displayTable = false;
    if (searchType === 'ApplicationNumber') {
      this.heading = 'No search results for Application Number.';
    } else if (searchType === 'AccountNumber') {
      this.heading = 'No search results for Account Number.';
    } else if (searchType === 'DateRange') {
      this.heading = 'No search results for Application Date Range.';
    } else {
      this.heading = 'No results found. Please try again with different criteria.';
    }
  }

  // Method to handle error when fetching table data
  handleError(error: any): void {
    console.error('Error fetching table data:', error);
    this.tableData = [];
    this.heading = 'An error occurred while fetching results. Please try again later.';
    this.displayTable = false;
  }

  // Toggle search collapse functionality
  toggleSearchCollapse(): void {
    const searchExpElement = document.querySelector('#searchExp') as HTMLElement;
    if (searchExpElement) {
      searchExpElement.classList.toggle('show');
    }
  }
}
