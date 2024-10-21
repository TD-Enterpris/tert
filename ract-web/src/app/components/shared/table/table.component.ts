import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchResultsDataService } from '../../../services/search-results-data.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnDestroy {

  accounts: { accountNumber: string, applicationDate: string, source: string, productPackage: string }[] = [];
  rowExpanded: { [key: string]: boolean } = {};
  searchResultsSubscription: Subscription | undefined;

  constructor(private searchResultsDataService: SearchResultsDataService) {}

  ngOnInit(): void {
    this.searchResultsSubscription = this.searchResultsDataService.getSearchResults().subscribe((result: any) => {
      console.log('Raw search results received:', result);

      if (result && result.data && result.data.length > 0) {
        this.accounts = result.data.map((item: any) => ({
          accountNumber: item?.loanDetails?.accounts?.[0]?.accountNumber || 'N/A',
          applicationDate: item?.loanDetails?.applicationDate || 'N/A',
          source: item?.loanDetails?.source || 'N/A',
          productPackage: item?.loanDetails?.accounts?.[0]?.productPackage || 'N/A'
        }));
        console.log('Mapped accounts data:', this.accounts);
      } else {
        console.log('No data received.');
      }
    });
  }

  toggleRow(rowId: string): void {
    this.rowExpanded[rowId] = !this.rowExpanded[rowId];
  }

  isRowExpanded(rowId: string): boolean {
    return !!this.rowExpanded[rowId];
  }

  ngOnDestroy(): void {
    if (this.searchResultsSubscription) {
      this.searchResultsSubscription.unsubscribe();
    }
  }
}
