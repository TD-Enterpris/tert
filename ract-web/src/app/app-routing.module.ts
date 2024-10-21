import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importing all the components for routing
import { DashboardComponent } from './components/post-login/dashboard/dashboard.component';
import { ConfigTableComponent } from './components/post-login/config-table/config-table.component';
import { DemographicInfoComponent } from './components/post-login/demographic-info/demographic-info.component';
import { EmailCommunicationComponent } from './components/post-login/email-communication/email-communication.component';
import { SearchResultsByComponent } from './components/post-login/search-results/search-results-by/search-results-by.component';
import { SearchResultsTableComponent } from './components/post-login/search-results/search-results-table/search-results-table.component';
import { SearchResultsTablePaginationComponent } from './components/post-login/search-results/search-results-table-pagination/search-results-table-pagination.component';
import { LoginComponent } from './components/pre-login/login/login.component';
import { HealthcheckComponent } from './components/healthcheck/healthcheck.component'; // Added HealthcheckComponent

// Importing AuthGuard for route protection
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Default route to login
  { path: 'login', component: LoginComponent },
  
  // Post-Login Routes with AuthGuard applied to the parent (no need for repeated canActivate in children)
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard],  // Protect the entire dashboard and its children
    children: [
      { path: 'search-results', component: SearchResultsByComponent },
      { path: 'config', component: ConfigTableComponent },
      { path: 'demographic-info', component: DemographicInfoComponent },
      { path: 'email-communication', component: EmailCommunicationComponent },
      { path: 'search-results-by', component: SearchResultsByComponent },
      { path: 'search-results-table', component: SearchResultsTableComponent },
      { path: 'search-results-table-pagination', component: SearchResultsTablePaginationComponent }
    ]
  },

  { path: 'healthcheck', component: HealthcheckComponent },

  // Wildcard route for a 404 page
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
