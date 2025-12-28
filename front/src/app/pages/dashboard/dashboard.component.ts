import { Component, OnInit, OnDestroy } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { SocketService } from '../../services/socket.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
interface StatCard {
  title: string;
  value: number;
  icon: string;
  change: string;
  color: string;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  avatar: string;
  color: string;
}

interface Appointment {
  id: number;
  patientName: string;
  time: string;
  type: string;
  status: string;
  avatar: string;
}

interface DepartmentData {
  labels: string[];
  values: number[];
}

interface SystemHealthItem {
  metric: string;
  value: number;
  status: 'excellent' | 'good' | 'normal';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] ,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  currentDate: string;
  maxDepartmentValue: number;
  
  // Dashboard data
  stats: StatCard[] = [
    { title: 'Total Patients', value: 1284, icon: 'people', change: '+12%', color: '#1976d2' },
    { title: 'Appointments Today', value: 42, icon: 'calendar_today', change: '+5%', color: '#2e7d32' },
    { title: 'New Patients (Monthly)', value: 68, icon: 'person_add', change: '+18%', color: '#ed6c02' },
    { title: 'Active Records', value: 958, icon: 'assignment', change: '+3%', color: '#0288d1' }
  ];
  
  recentActivities: Activity[] = [
    { 
      id: 1, 
      type: 'New Patient', 
      description: 'Emily Johnson registered as a new patient',
      time: '20 minutes ago',
      avatar: '/avatar1.jpg', 
      color: '#1976d2' 
    },
    { 
      id: 2, 
      type: 'Appointment', 
      description: 'Dr. Williams completed appointment with James Smith',
      time: '1 hour ago',
      avatar: '/avatar2.jpg', 
      color: '#2e7d32' 
    },
    { 
      id: 3, 
      type: 'Lab Results', 
      description: 'Blood test results updated for Michael Brown',
      time: '3 hours ago',
      avatar: '/avatar3.jpg', 
      color: '#ed6c02' 
    },
    { 
      id: 4, 
      type: 'Medical Record', 
      description: 'Dr. Miller added a new medical record for Robert Davis',
      time: '5 hours ago',
      avatar: '/avatar4.jpg', 
      color: '#0288d1' 
    }
  ];
  
  upcomingAppointments: Appointment[] = [
    { 
      id: 1, 
      patientName: 'Sarah Thompson', 
      time: '10:00 AM', 
      type: 'Follow-up', 
      status: 'confirmed',
      avatar: '/avatar5.jpg',
    },
    { 
      id: 2, 
      patientName: 'David Wilson', 
      time: '11:30 AM', 
      type: 'Consultation', 
      status: 'confirmed',
      avatar: '/avatar6.jpg',
    },
    { 
      id: 3, 
      patientName: 'Jennifer Garcia', 
      time: '1:15 PM', 
      type: 'Check-up', 
      status: 'pending',
      avatar: '/avatar7.jpg',
    },
    { 
      id: 4, 
      patientName: 'Thomas Martinez', 
      time: '3:45 PM', 
      type: 'Lab Review', 
      status: 'confirmed',
      avatar: '/avatar8.jpg',
    }
  ];
  
  patientsByDepartment: DepartmentData = {
    labels: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine'],
    values: [125, 98, 156, 104, 182]
  };
  
  systemHealth: SystemHealthItem[] = [
    { metric: 'Database Performance', value: 92, status: 'good' },
    { metric: 'API Response Time', value: 87, status: 'good' },
    { metric: 'System Uptime', value: 99.8, status: 'excellent' },
    { metric: 'Storage Usage', value: 68, status: 'normal' }
  ];
  
  private loadingTimer: any;

  constructor() {
    // Format the current date
    this.currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Calculate max department value
    this.maxDepartmentValue = Math.max(...this.patientsByDepartment.values);
  }

  ngOnInit(): void {
    // Simulate data loading
    this.loadingTimer = setTimeout(() => {
      this.loading = false;
    }, 1500);
  }

  ngOnDestroy(): void {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  }

  /**
   * Get the appropriate CSS class for appointment type chips
   */
  getAppointmentChipClass(type: string): string {
    switch (type) {
      case 'Consultation':
        return 'consultation-chip';
      case 'Lab Review':
        return 'lab-review-chip';
      default:
        return 'follow-up-chip';
    }
  }

  /**
   * Get the appropriate CSS class for health status icons
   */
  getHealthStatusClass(status: string): string {
    switch (status) {
      case 'excellent':
        return 'excellent-status';
      case 'good':
        return 'good-status';
      default:
        return 'normal-status';
    }
  }

  /**
   * Get the appropriate color for health status progress bars
   */
  getHealthStatusColor(status: string): ThemePalette {
    switch (status) {
      case 'excellent':
        return 'accent';
      case 'good':
        return 'primary';
      default:
        return 'warn';
    }
  }
}