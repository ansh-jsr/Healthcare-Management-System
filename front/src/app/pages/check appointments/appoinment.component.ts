import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Appointment {
  _id?: string;
  patientName?: string;
  patientId?: string;
  doctorName?: string;
  appointmentType?: string;
  date: string;
  time: string;
  status?: string;
}

@Component({
  selector: 'app-doctor-appointments',
  templateUrl: './appoinment.component.html',
  styleUrls: ['./appoinment.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class Appoinment implements OnInit {
  activeTab: string = 'upcoming';
  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  uploading: { [id: string]: boolean } = {};
  loading: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    document.querySelector('.tab-content')?.classList.remove('fade-in');
    setTimeout(() => {
      document.querySelector('.tab-content')?.classList.add('fade-in');
    }, 50);
  }

  loadAppointments(): void {
    this.loading = true;
    console.log('🔄 Loading appointments...');
    
    // Check which endpoint to call based on user role
    // For now, let's try both and see which one works
    
    // First try patient appointments
    this.apiService.getPatientAppointments().subscribe({
      next: (data: { past: any[]; upcoming: any[] }) => {
        console.log('✅ Patient appointments data received:', data);
        this.processAppointmentData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading patient appointments:', error);
        console.log('🔄 Trying doctor appointments instead...');
        
        // If patient fails, try doctor appointments
        this.apiService.getDoctorAppointments().subscribe({
          next: (data: { past: any[]; upcoming: any[] }) => {
            console.log('✅ Doctor appointments data received:', data);
            this.processAppointmentData(data);
            this.loading = false;
          },
          error: (docError) => {
            console.error('❌ Error loading doctor appointments:', docError);
            this.handleLoadingError();
          }
        });
      }
    });
  }

  private processAppointmentData(data: { past: any[]; upcoming: any[] }): void {
    console.log('🔄 Processing appointment data:', data);
    
    // Ensure data structure is correct
    if (!data || (!data.past && !data.upcoming)) {
      console.warn('⚠️ Invalid data structure received:', data);
      this.handleLoadingError();
      return;
    }

    // Process past appointments
    this.pastAppointments = (data.past || []).map(app => {
      console.log('Processing past appointment:', app);
      return {
        _id: app._id || app.id,
        patientName: app.patientName || (app.patient?.name) || 'Unknown Patient',
        patientId: app.patient?._id || app.patient || null, 
        appointmentType: app.appointmentType || 'General',
        date: app.date,
        time: app.timeSlot || app.time || '',
        status: 'completed'
      };
    });

    // Process upcoming appointments
    this.upcomingAppointments = (data.upcoming || []).map(app => {
      console.log('Processing upcoming appointment:', app);
      return {
        _id: app._id || app.id,
        patientName: app.patientName || (app.patient?.name) || 'Unknown Patient',
        patientId: app.patient?._id || app.patient || null, 
        appointmentType: app.appointmentType || 'General',
        date: app.date,
        time: app.timeSlot || app.time || '',
        status: 'scheduled'
      };
    });

    console.log('✅ Appointments processed:', {
      upcoming: this.upcomingAppointments.length,
      past: this.pastAppointments.length,
      upcomingData: this.upcomingAppointments,
      pastData: this.pastAppointments
    });
  }

  private handleLoadingError(): void {
    console.error('❌ Failed to load appointments from both endpoints');
    this.pastAppointments = [];
    this.upcomingAppointments = [];
    this.loading = false;
    
    // Show user-friendly error message
    alert('Unable to load appointments. Please check your connection and try again.');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Invalid Date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      const day = date.getDate();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      const ordinalSuffix = this.getOrdinalSuffix(day);
      return `${day}${ordinalSuffix} ${month} ${year}`;
    } catch (error) {
      console.error('❌ Date formatting error:', error);
      return 'Invalid Date';
    }
  }

  private getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

 openUpload(appointment: Appointment): void {
  if (!appointment._id) {
    console.warn('⚠️ No appointment ID provided for upload');
    return;
  }

  console.log('📤 Starting upload for appointment:', appointment._id);
  this.uploading[appointment._id] = true;

  const queryParams: any = { 
    appointmentId: appointment._id,
    patientName: appointment.patientName,
  };


   if (appointment.patientId) {
    queryParams.patientId = appointment.patientId;
  }
  
  // Pass both appointmentId and patient information
  this.router.navigate(['/dashboard/upload'], {
    queryParams: { 
      appointmentId: appointment._id,
      patientName: appointment.patientName,
      // Add other patient details if available
    }
  }).then(() => {
    this.uploading[appointment._id!] = false;
    console.log('✅ Navigated to upload page');
  }).catch(error => {
    console.error('❌ Navigation error:', error);
    this.uploading[appointment._id!] = false;
    alert('Unable to open upload page. Please try again.');
  });
}

  viewMedicalRecord(appointmentId: string | undefined): void {
    if (!appointmentId) {
      console.warn('⚠️ No appointment ID provided for viewing record');
      return;
    }

    console.log('👁️ Viewing medical record for appointment:', appointmentId);
    this.router.navigate(['/medical-record-view'], {
      queryParams: { appointmentId: appointmentId }
    }).catch(error => {
      console.error('❌ Navigation error:', error);
      alert('Unable to open medical record. Please try again.');
    });
  }

  
  trackByAppointmentId(index: number, appointment: Appointment): string {
    return appointment._id || index.toString();
  }
}