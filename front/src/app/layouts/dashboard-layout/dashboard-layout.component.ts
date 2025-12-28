import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { sharedImports } from '../../material';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
  imports: [
    ...sharedImports,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    NgClass
  ],
  standalone: true
})
export class DashboardLayoutComponent implements OnInit {
  isMobile = false;
  drawerOpen = true;
  notifications: any[] = [];
  unreadCount = 0;
  showNotifications = false;
  notificationAutoCloseTimer: any;
  userType: 'patient' | 'doctor' | null = null;
  userInitials: string = 'JD';

  patientMenuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { text: 'Book Appointments', icon: 'event', path: 'appointments'},
    { text: 'New Patient', icon: 'person_add', path: 'patients/new' },
    { text: 'Patient Records', icon: 'assignment_ind', path: 'pending' },
    { text: 'News & Updates', icon: 'article', path: 'blog' },
    { text: 'Settings', icon: 'settings', path: 'settings' },
    { text : 'Profile', icon : 'person', path : 'profile'},
    { text: 'Help & Support', icon: 'help', path: 'help-support' },
    { text: 'FAQ', icon: 'question_answer', path: 'faq' }
    
  ];

  doctorMenuItems = [
    { text: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { text: 'Patient Records', icon: 'assignment_ind', path: 'patients' },
   {text : 'View Appointment', icon : 'event', path : 'appoinment'},
   {text : 'Document Updates', icon : 'assignment_ind', path : 'document'},
    { text: 'Notifications', icon: 'notifications', path: 'noti' },
    { text: 'News & Updates', icon: 'article', path: 'blog' },
    { text: 'Settings', icon: 'settings', path: 'settings' },
     { text : 'Profile', icon : 'person', path : 'profile'},
    { text: 'Help & Support', icon: 'help', path: 'help-support' },
    { text: 'FAQ', icon: 'question_answer', path: 'faq' }
  ];

  menuItems: { text: string; icon: string; path: string }[] = [];

  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile = result.matches;
      if (this.isMobile) {
        this.drawerOpen = false;
      }
    });

    // Fetch user type and set menu items
    this.setMenuItemsBasedOnUserType();

    // Fetch notifications when component initializes
    this.fetchNotifications();

    // Set up a timer to check for new notifications every minute
    setInterval(() => {
      this.fetchNotifications();
    }, 30000);
  }

  setMenuItemsBasedOnUserType() {
    // Try to get user type from localStorage first
    const storedUser = localStorage.getItem('user');
    console.log('Stored user in localStorage:', storedUser); // Debug log

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userType = user.role ? user.role.toLowerCase() as 'patient' | 'doctor' : null;
        const firstInitial = user.firstName ? user.firstName.charAt(0).toUpperCase() : 'J';
        this.userInitials = `${firstInitial}`;
        console.log('User type from localStorage:', this.userType); // Debug log
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    // If userType is set and valid, assign menu items
    if (this.userType === 'patient' || this.userType === 'doctor') {
      this.menuItems = this.userType === 'patient' ? this.patientMenuItems : this.doctorMenuItems;
      console.log('Menu items set based on userType:', this.menuItems); // Debug log
      return;
    }

    // If userType is not set or invalid, fetch from API
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('User data from API:', user); // Debug log
        this.userType = user.role ? user.role.toLowerCase() as 'patient' | 'doctor' : 'patient'; // Fallback to 'patient'
        this.menuItems = this.userType === 'patient' ? this.patientMenuItems : this.doctorMenuItems;
        console.log('Menu items set after API call:', this.menuItems); // Debug log
      },
      error: (error) => {
        console.error('Error fetching current user:', error);
        // Fallback to patient menu if API call fails
        this.userType = 'patient';
        this.menuItems = this.patientMenuItems;
        console.log('Fallback to patient menu items:', this.menuItems); // Debug log
      }
    });
  }

  fetchNotifications() {
    this.apiService.getUserNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = this.notifications.filter(notification => !notification.read).length;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      }
    });
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  toggleNotifications() {
  this.showNotifications = !this.showNotifications;

  if (this.showNotifications) {
    // If there are unread notifications, mark them as read
    if (this.unreadCount > 0) {
      this.notifications.forEach(notification => {
        if (!notification.read) {
          notification.read = true;
        }
      });
      this.unreadCount = 0;
    }

    // Clear any existing timer before starting a new one
    if (this.notificationAutoCloseTimer) {
      clearTimeout(this.notificationAutoCloseTimer);
    }

    // Start a new 30-second auto-close timer
    this.notificationAutoCloseTimer = setTimeout(() => {
      this.showNotifications = false;
    }, 10000); // 30 seconds
  } else {
    // If the panel was manually closed, clear the timer
    if (this.notificationAutoCloseTimer) {
      clearTimeout(this.notificationAutoCloseTimer);
      this.notificationAutoCloseTimer = null;
    }
  }
}


  markAsRead(notification: any) {
    if (!notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  markAllAsRead() {
    this.apiService.markAllNotificationsAsRead().subscribe({
      next: () => {
         this.fetchNotifications(); 
      },
      error: (err) => {
        console.error('Error marking all notifications as read', err);
      }
    });
  }

  logout() {
    this.apiService.logout();
    this.router.navigate(['']);
  }
}