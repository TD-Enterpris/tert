import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject = new BehaviorSubject<string>('PDI-RACT-GA'); // Default role is PDI-RACT-GA
  currentRole$ = this.currentRoleSubject.asObservable();

  // Method to set the current role
  setCurrentRole(role: string): void {
    sessionStorage.setItem('currentRole', role);
    this.currentRoleSubject.next(role);
  }

  // Method to get the current role
  getCurrentRole(): string {
    return sessionStorage.getItem('currentRole') || 'PDI-RACT-GA';
  }
}
