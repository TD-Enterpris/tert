import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importing components
import { DashboardComponent } from './components/post-login/dashboard/dashboard.component';
import { ConfigTableComponent } from './components/post-login/config-table/config-table.component';
import { SearchResultsComponent } from './components/post-login/search-results/search-results.component';
import { LoginComponent } from './components/pre-login/login/login.component';
import { HealthcheckComponent } from './components/healthcheck/healthcheck.component'; 

// Import AuthGuard for route protection
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent },

  // Standalone route for /search-results
  { 
    path: 'search-results', 
    component: SearchResultsComponent, 
    canActivate: [AuthGuard] 
  },

  // Standalone route for /config
  { 
    path: 'config', 
    component: ConfigTableComponent, 
    canActivate: [AuthGuard] 
  },

  // Main dashboard route
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },

  { path: 'healthcheck', component: HealthcheckComponent },

  // Wildcard route for undefined paths
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
