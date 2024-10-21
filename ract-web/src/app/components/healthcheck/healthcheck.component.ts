import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-healthcheck',
  templateUrl: './healthcheck.component.html',
  styleUrls: ['./healthcheck.component.css']
})
export class HealthcheckComponent implements OnInit {

  healthStatus: any;

  constructor() { }

  ngOnInit(): void {
    this.healthStatus = this.getUIHealth();
  }

  // A simple method that mocks a UI health check
  getUIHealth() {
    return {
      status: 'Healthy', // This can be static or dynamic
      version: '1.0.0-SNAPSHOT', // Version of the UI
      timestamp: new Date().toISOString() // Current timestamp
    };
  }
}
