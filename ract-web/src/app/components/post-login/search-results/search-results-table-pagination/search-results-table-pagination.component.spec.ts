import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsTablePaginationComponent } from './search-results-table-pagination.component';

describe('SearchResultsTablePaginationComponent', () => {
  let component: SearchResultsTablePaginationComponent;
  let fixture: ComponentFixture<SearchResultsTablePaginationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultsTablePaginationComponent]
    });
    fixture = TestBed.createComponent(SearchResultsTablePaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
