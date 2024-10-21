import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchResultsDataService {

  private searchResults = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {}

  // Method to load data from JSON file
  loadDataFromFile(): Observable<any> {
    return this.http.get('/assets/table-data.json');  // Assuming your JSON file is placed in the assets folder
  }

  // Method to set search results after data is fetched
  setSearchResults(data: any) {
    this.searchResults.next(data);
  }

  // Method to get search results
  getSearchResults(): Observable<any> {
    return this.searchResults.asObservable();
  }

  // Method to clear search results
  clearSearchResults() {
    this.searchResults.next(null);
  }
}
