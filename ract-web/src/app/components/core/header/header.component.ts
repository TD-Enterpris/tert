import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';
declare const Tdheader: any;
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentRole: string | null = null; // Current active role
  showToggleButton: boolean = false; // Flag to show/hide role toggle button
  isAuthenticated: boolean = false; // Authentication flag
  userId: string | null = null; // Store user ID
  isDropdownOpen = false; // Track dropdown menu state

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to authentication status
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (this.isAuthenticated) {
        this.loadRoles();
        this.loadUserId(); // Fetch user ID
      }
    });

    // Subscribe to role changes
    this.authService.currentRole$.subscribe(role => {
      this.currentRole = role;
      this.showToggleButton = !!role; // Show toggle button if a role is available
    });

    // Reload roles after navigation
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (this.isAuthenticated) {
        this.loadRoles();
      }
    });
  }

  // Load roles from AuthService
  loadRoles(): void {
    if (!this.isAuthenticated) {
      return;
    }

    const role = this.authService.getCurrentRole();
    this.currentRole = role;
    this.showToggleButton = !!role;
  }

  // New method to load user ID and handle potential null values
  loadUserId(): void {
    this.userId = this.authService.getCurrentUserID(); // Fetch user ID
    if (!this.userId) {
      console.warn('User ID is null in header, retrying...');
      // Retry fetching user ID after a delay if it's initially null
      setTimeout(() => {
        this.userId = this.authService.getCurrentUserID();
        console.log('Retrying User ID in Header:', this.userId);
      }, 500);  // Retry after 500ms to give time for any async issues
    } else {
      console.log('User ID in Header:', this.userId);  // Log the retrieved user ID
    }
  }

  // Toggle between roles and update navigation
  toggleRole(): void {
    if (this.currentRole === 'PDI-RACT-GA') {
      this.currentRole = 'PDI-RACT-ADMIN';
      this.router.navigate(['/dashboard/config'], { replaceUrl: true });
    } else {
      this.currentRole = 'PDI-RACT-GA';
      this.router.navigate(['/dashboard/search-results'], { replaceUrl: true });
    }
    this.authService.setCurrentRole(this.currentRole!); // Update role in AuthService
  }

  // Handle "Skip to Main Content" functionality
  skipToMain(event: Event): void {
    event.preventDefault(); // Prevent the default anchor tag behavior (page refresh)
    
    const mainContent = document.getElementById('main');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1'); // Ensure main content is focusable
      mainContent.focus(); // Move focus to the main content area
      mainContent.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the main content
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Add this method to handle keydown events
  handleKeydown(event: KeyboardEvent): void {
    const menuItems = Array.from(document.querySelectorAll('#user-menu button')) as HTMLElement[];
    const currentIndex = menuItems.findIndex(item => document.activeElement === item);
  
    console.log('Menu items:', menuItems);
    console.log('Key pressed:', event.key); 
    console.log('Current focus index:', currentIndex);  // Log current index
  
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      console.log('Enter or Space pressed - Toggling dropdown');
      this.toggleDropdown();  // Show the dropdown, no changes here
  
      // Focus on the first item in the dropdown after opening
      if (this.isDropdownOpen && menuItems.length > 0) {
        console.log('Focusing on the first item in the dropdown');
        menuItems[0].focus();
      }
    } else if (event.key === 'Escape' && this.isDropdownOpen) {
      console.log('Escape key pressed - Closing dropdown');
      this.isDropdownOpen = false;
      const toggleButton = document.querySelector('#td-header-nav-dropdown-19328');
      if (toggleButton) {
        console.log('Focusing on dropdown toggle button after closing');
        (toggleButton as HTMLElement).focus();  // Move focus back to toggle button
      }
    } else if (this.isDropdownOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      console.log('Arrow key pressed:', event.key);  // Log when arrow key is pressed
  
      // Arrow Key Navigation within the dropdown
      if (currentIndex !== -1) {
        if (event.key === 'ArrowDown') {
          const nextIndex = (currentIndex + 1) % menuItems.length;
          console.log('Moving focus to next item, index:', nextIndex);
          (menuItems[nextIndex] as HTMLElement).focus();  // Move to next item
        } else if (event.key === 'ArrowUp') {
          const prevIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
          console.log('Moving focus to previous item, index:', prevIndex);
          (menuItems[prevIndex] as HTMLElement).focus();  // Move to previous item
        }
      } else {
        console.log('Current focus index is -1, focusing on the first menu item');
        if (menuItems.length > 0) {
          menuItems[0].focus();  // Focus the first item if no current index is found
        }
      }
    } else {
      console.log('Key pressed does not require any action');
    }
  }
  
  
  

  // Close dropdown when clicking outside of it
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    const clickedElement = event.target as HTMLElement;
    if (!clickedElement.closest('.td-header-nav-dropdown') && this.isDropdownOpen) {
      console.log('Clicked outside the dropdown, closing it');
      this.isDropdownOpen = false;
    }
  }

  // Logout method
  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    }, error => {
      console.error('Logout error:', error);
    });
  }

  ngAfterViewInit():void{
    let $thn = document.querySelectorAll (".td-header-nav");
    let tdHeaderTrigger = new Tdheader($thn);
    tdHeaderTrigger.init();
  }

}
