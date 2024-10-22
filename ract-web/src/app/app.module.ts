import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Import the HttpClientModule
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule

// Core Components
import { HeaderComponent } from './components/core/header/header.component';
import { FooterComponent } from './components/core/footer/footer.component';

// Post-Login Components
import { DashboardComponent } from './components/post-login/dashboard/dashboard.component';
import { ConfigTableComponent } from './components/post-login/config-table/config-table.component';
import { DemographicInfoComponent } from './components/post-login/demographic-info/demographic-info.component';
import { EmailCommunicationComponent } from './components/post-login/email-communication/email-communication.component';
import { SearchResultsByComponent } from './components/post-login/search-results/search-results-by/search-results-by.component';
import { SearchResultsTableComponent } from './components/post-login/search-results/search-results-table/search-results-table.component';
import { SearchResultsTablePaginationComponent } from './components/post-login/search-results/search-results-table-pagination/search-results-table-pagination.component';

// Pre-Login Component
import { LoginComponent } from './components/pre-login/login/login.component';

// Shared Components
import { AccordionComponent } from './components/shared/accordion/accordion.component';
import { TableComponent } from './components/shared/table/table.component';
import { ExpandedRowComponent } from './components/shared/table/expanded-row/expanded-row.component';

// HealthCheck Component
import { HealthcheckComponent } from './components/healthcheck/healthcheck.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchResultsComponent } from './components/post-login/search-results/search-results.component';

@NgModule({
  declarations: [
    AppComponent,
    // Core Components
    HeaderComponent,
    FooterComponent,

    // Post-Login Components
    DashboardComponent,
    ConfigTableComponent,
    DemographicInfoComponent,
    EmailCommunicationComponent,
    SearchResultsByComponent,
    SearchResultsTableComponent,
    SearchResultsTablePaginationComponent,

    // Pre-Login Component
    LoginComponent,

    // Shared Components
    AccordionComponent,
    TableComponent,
    ExpandedRowComponent,

    // HealthCheck Component
    HealthcheckComponent,
     SearchResultsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgbModule // Add FormsModule here
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
