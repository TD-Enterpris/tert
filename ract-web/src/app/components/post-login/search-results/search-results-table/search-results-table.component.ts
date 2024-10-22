import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-search-results-table',
  templateUrl: './search-results-table.component.html',
  styleUrls: ['./search-results-table.component.css']
})
export class SearchResultsTableComponent {
  @Input() searchParams: any;
  tableData: any[] = [];
  heading: string = 'Please enter your search criteria to view results.';
  displayTable: boolean = false;


  handleNoResults() {
    this.tableData = [];
    this.heading = 'No results found. Please try again with different criteria.';
    this.displayTable = false;
  }

  handleError(error: any) {
    console.error('Error fetching table data:', error);
    this.tableData = [];
    this.heading = 'An error occurred while fetching results. Please try again later.';
    this.displayTable = false;
  }

  toggleSearchCollapse() {
    const searchExpElement = document.querySelector('#searchExp') as HTMLElement;
    if (searchExpElement) {
      searchExpElement.classList.toggle('show');
    }
  }
}
