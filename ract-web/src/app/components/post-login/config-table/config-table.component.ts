import { Component } from '@angular/core';

@Component({
  selector: 'app-config-table',
  templateUrl: './config-table.component.html',
  styleUrls: ['./config-table.component.css']
})
export class ConfigTableComponent {
  
  rows: any[] = [
    {
      regcId: '101',
      configName: 'Config A',
      configValue: 'Value A',
      description: 'Description A',
      isActive: true,
      effectiveStartDate: '2024-01-01',
      effectiveEndDate: '2024-12-31',
      isEditMode: false,
      isInvalid: false // Tracks if the row has invalid fields
    }
  ];

  errorMessage = ''; // Holds the error message

  // Add a new empty row to the table
  addRow() {
    const newRow = {
      regcId: '',
      configName: '',
      configValue: '',
      description: '',
      isActive: false,
      effectiveStartDate: '',
      effectiveEndDate: '',
      isEditMode: true,
      isInvalid: false
    };
    this.rows.push(newRow);
  }

  // Switch the row to edit mode
  editRow(index: number) {
    this.rows[index].isEditMode = true;
    this.errorMessage = ''; // Clear error message when editing
  }

  // Save the row data and validate
  saveRow(index: number) {
    const row = this.rows[index];
    
    // Check for empty fields
    if (!row.regcId || !row.configName || !row.configValue || !row.description || !row.effectiveStartDate || !row.effectiveEndDate) {
      row.isInvalid = true; // Mark the row as having invalid fields
      this.errorMessage = 'Please fill out all fields before saving.';
    } else {
      // Reset the invalid state and clear error message if fields are valid
      row.isInvalid = false;
      this.errorMessage = '';

      // Save logic (if connected to backend, etc.)
      console.log('Row data saved:', row);

      // Exit edit mode after saving
      row.isEditMode = false;
    }
  }
}
