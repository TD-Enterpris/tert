import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsByComponent } from './search-results-by.component';

describe('SearchResultsByComponent', () => {
  let component: SearchResultsByComponent;
  let fixture: ComponentFixture<SearchResultsByComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultsByComponent]
    });
    fixture = TestBed.createComponent(SearchResultsByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
