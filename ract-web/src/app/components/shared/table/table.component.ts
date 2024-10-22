import { Component } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  // Map to track which rows are expanded or collapsed
  rowExpanded: { [key: string]: boolean } = {};

  // Method to toggle the row's expanded state
  toggleRow(rowId: string): void {
    this.rowExpanded[rowId] = !this.rowExpanded[rowId];  // Toggle state
  }

  // Method to check if a row is expanded
  isRowExpanded(rowId: string): boolean {
    return !!this.rowExpanded[rowId];  // Return true if expanded
  }
}
