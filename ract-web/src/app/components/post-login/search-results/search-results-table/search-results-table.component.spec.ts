import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsTableComponent } from './search-results-table.component';

describe('SearchResultsTableComponent', () => {
  let component: SearchResultsTableComponent;
  let fixture: ComponentFixture<SearchResultsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultsTableComponent]
    });
    fixture = TestBed.createComponent(SearchResultsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
