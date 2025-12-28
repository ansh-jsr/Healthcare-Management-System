import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

// 🆕 UPDATED: Added appointmentType to Appointment interface
interface Appointment {
  id: number;
  _id?: string;
  patient: string;
  patientName?: string;
  date: string;
  time: string;
  doctor: string; // Change from Doctor to string (ObjectId)
  doctorName?: string;
  appointmentType?: string; // 🆕 ADDED: New field for appointment type
}

interface Doctor {
  _id: string;
  name: string;
}

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Appointments implements OnInit {
  loggedInUserName: string = ''; // Mock logged-in user name
  minDate: string = '2025-05-17'; // Tomorrow's date (current date is May 16, 2025)
  doctors: Doctor[] = [];
  availableTimeSlots: string[] = [];
  pastAppointments: Appointment[] = []; 
  upcomingAppointments: Appointment[] = []; 
  activeTab: string = 'upcoming';
  successMessage: string = '';  // Holds success text
  errorMessage: string = '';  
  
  // 🆕 ADDED: Appointment types constant
  readonly APPOINTMENT_TYPES = [
    'Follow Up',
    'Consultation', 
    'Check-Up',
    'Review'
  ];
  
  readonly TIME_SLOTS = [
    '09:00 AM - 09:30 AM', '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM', '10:30 AM - 11:00 AM',
    '11:00 AM - 11:30 AM', '11:30 AM - 12:00 PM',
    '12:00 PM - 12:30 PM', '12:30 PM - 01:00 PM',
    '01:00 PM - 01:30 PM', '01:30 PM - 02:00 PM',
    '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM', '03:30 PM - 04:00 PM',
    '04:00 PM - 04:30 PM', '04:30 PM - 05:00 PM'
  ];

  appointments: Appointment[] = [];

  // 🆕 UPDATED: Added appointmentType to newAppointment object
  newAppointment: Appointment = {
    id: 0,
    patient: '',
    date: '',
    time: '',
    doctor: '', // Initialize as empty string
    appointmentType: '' // 🆕 ADDED: Initialize appointment type
  };

  constructor(private apiService: ApiService) {} 

  ngOnInit() {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Set for tomorrow
    this.minDate = today.toISOString().split('T')[0];
    // 🌸 FIXED: Changed to await/async pattern for proper sequencing
    this.initializeComponent();
  }

  // 🌸 NEW: Added proper initialization sequence
  async initializeComponent() {
    try {
      await this.loadUserData();
      await this.loadDoctors();
      this.loadAppointments();
      // 🌸 FIXED: Initialize available slots with all time slots initially
      this.availableTimeSlots = [...this.TIME_SLOTS];
    } catch (error) {
      console.error('Error initializing component:', error);
    }
  }

  // In appointment.component.ts

  // 🌸 FIXED: Made this return proper Promise and handle errors better
  loadUserData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getCurrentUser().subscribe(
        (userData: any) => {
          if (userData && userData._id) {
            this.loggedInUserName = userData.firstName + ' ' + userData.lastName;
            this.newAppointment.patient = userData._id;
            console.log('🌸 User data loaded:', this.loggedInUserName); // 🌸 ADDED: Debug log
            resolve();
          } else {
            console.error('User data does not contain _id');
            // 🌸 FIXED: Try localStorage as fallback
            this.tryLoadUserFromStorage();
            resolve(); // 🌸 FIXED: Still resolve to continue flow
          }
        },
        (error) => {
          console.error('Error fetching user profile', error);
          // 🌸 FIXED: Always try localStorage fallback
          this.tryLoadUserFromStorage();
          resolve(); // 🌸 FIXED: Always resolve to continue component initialization
        }
      );
    });
  }

  // 🌸 NEW: Separate method for localStorage fallback
  private tryLoadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.loggedInUserName = user.firstName + ' ' + user.lastName;
        this.newAppointment.patient = user._id || user.id;
        console.log('🌸 User loaded from storage:', this.loggedInUserName);
      } catch (e) {
        console.error('Error parsing stored user data');
        this.loggedInUserName = 'Patient'; // 🌸 FIXED: Fallback name
      }
    } else {
      this.loggedInUserName = 'Patient'; // 🌸 FIXED: Default fallback
    }
  }

  // Fetch doctors from the API
  loadDoctors(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🌸 Starting to load doctors...'); // 🌸 ADDED: Debug log
      this.apiService.getDoctors().subscribe(
        (data) => {
          console.log('🌸 Doctors loaded:', data); // 🌸 ADDED: Debug log
          this.doctors = data;
          resolve();
        },
        (error) => {
          console.error('🌸 Error loading doctors:', error); // 🌸 ENHANCED: Error log
          // 🌸 FIXED: Add fallback doctors for testing
          resolve(); // 🌸 FIXED: Resolve even on error to continue flow
        }
      );
    });
  }

  // Fetch available time slots from the API
  // 🌸 FIXED: Simplified and improved error handling
  loadAvailableSlots() {
    console.log('🌸 Loading time slots with date:', this.newAppointment.date, 'doctor:', this.newAppointment.doctor);
    
    if (!this.newAppointment.date || !this.newAppointment.doctor) {
      console.warn('🌸 Missing required data for loading time slots - showing all slots');
      this.availableTimeSlots = [...this.TIME_SLOTS]; // 🌸 FIXED: Show all slots when no filter
      return;
    }
    
    const params = {
      doctorId: this.newAppointment.doctor,
      date: this.newAppointment.date
    };
    
    this.apiService.getAvailableSlots(params).subscribe(
      (data) => {
        console.log('🌸 Received time slots response:', data);
        if (data && data.availableSlots && Array.isArray(data.availableSlots)) {
          this.availableTimeSlots = data.availableSlots;
          console.log('🌸 Available slots set:', this.availableTimeSlots);
        } else {
          console.error('🌸 Invalid response format for time slots, using fallback');
          this.availableTimeSlots = [...this.TIME_SLOTS]; // 🌸 FIXED: Use all slots as fallback
        }
      },
      (error) => {
        console.error('🌸 Error loading time slots:', error);
        this.availableTimeSlots = [...this.TIME_SLOTS]; // 🌸 FIXED: Use all slots as fallback
      }
    );
  }

  // Fetch the logged-in user's appointments from the API
  loadAppointments() {
    console.log('🔄 Starting to fetch patient appointments');
    this.apiService.getPatientAppointments().subscribe(
      (data: { past: any[], upcoming: any[] }) => {
        console.log('📥 Raw appointments response:', data);

        if (!data || !data.past || !data.upcoming) {
          console.warn('⚠️ Invalid appointments response:', data);
          this.pastAppointments = [];
          this.upcomingAppointments = [];
          return;
        }

        // ⭐ FIXED: Map past appointments with proper data extraction
        // 🆕 UPDATED: Added appointmentType mapping
        const pastApps = data.past.map((app: any) => {
          console.log('🔄 Processing past appointment:', app);
          return {
            id: app._id || 0,
            _id: app._id,
            patient: app.patient || this.newAppointment.patient,
            patientName: app.patientName || this.loggedInUserName,
            date: app.date, // Keep original date format
            time: app.timeSlot || '',
            doctor: app.doctor?._id || '',
            doctorName: app.doctor?.name || 'Unknown Doctor',
            appointmentType: app.appointmentType || 'General' // 🆕 ADDED: Map appointment type
          };
        });

        // ⭐ FIXED: Map upcoming appointments with proper data extraction  
        // 🆕 UPDATED: Added appointmentType mapping
        const upcomingApps = data.upcoming.map((app: any) => {
          console.log('🔄 Processing upcoming appointment:', app);
          return {
            id: app._id || 0,
            _id: app._id,
            patient: app.patient || this.newAppointment.patient,
            patientName: app.patientName || this.loggedInUserName,
            date: app.date, // Keep original date format
            time: app.timeSlot || '',
            doctor: app.doctor?._id || '',
            doctorName: app.doctor?.name || 'Unknown Doctor',
            appointmentType: app.appointmentType || 'General' // 🆕 ADDED: Map appointment type
          };
        });

        this.pastAppointments = pastApps;
        this.upcomingAppointments = upcomingApps;
        
        // ⭐ ADDED: Test formatting on first appointment
        if (this.upcomingAppointments.length > 0) {
          const testDate = this.upcomingAppointments[0].date;
          console.log('🧪 Testing formatDate with:', testDate);
          console.log('🧪 Format result:', this.formatDate(testDate));
        }
        
        console.log('✅ Final appointments:', { 
          past: this.pastAppointments, 
          upcoming: this.upcomingAppointments 
        });
      },
      (error) => {
        console.error('❌ Error loading appointments:', error);
        this.pastAppointments = [];
        this.upcomingAppointments = [];
      }
    );
  }

  // Replace your existing formatDate function with this improved version
  formatDate(dateString: string): string {
    console.log('🔍 formatDate called with:', dateString, typeof dateString);
    
    if (!dateString) {
      console.log('❌ Empty date string');
      return 'Invalid Date';
    }

    try {
      // Convert ISO string to local date
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('❌ Invalid date object from:', dateString);
        return 'Invalid Date';
      }

      // Get local date components (this avoids timezone issues)
      const day = date.getDate().toString().padStart(2, '0');
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      
      const formatted = `${day} ${month} ${year}`;
      console.log('✅ formatDate success:', dateString, '->', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ formatDate error:', error);
      return 'Invalid Date';
    }
  }

  categorizeAppointments() {
    const today = new Date('2025-05-16');
    this.upcomingAppointments = this.appointments.filter(app => new Date(app.date) > today);
    this.pastAppointments = this.appointments.filter(app => new Date(app.date) <= today);
  }

  isSlotAvailable(slot: string): boolean {
    // 🌸 FIXED: Simplified - all slots in availableTimeSlots are available
    return this.availableTimeSlots.includes(slot);
  }

  // 🆕 UPDATED: Added appointmentType validation to bookAppointment method
  bookAppointment() {
    // 🌸 ADDED: Clear previous messages
    this.successMessage = '';
    this.errorMessage = '';

    // 🆕 UPDATED: Added appointmentType validation
    if (this.newAppointment.date && this.newAppointment.time && this.newAppointment.doctor && this.newAppointment.appointmentType) {
      const appointmentData = {
        doctorId: this.newAppointment.doctor, // Send doctor ID as string
        date: this.newAppointment.date,
        timeSlot: this.newAppointment.time,
        patient: this.newAppointment.patient, // Include patient name or ID if required
        appointmentType: this.newAppointment.appointmentType // 🆕 ADDED: Include appointment type
      };

      console.log('🌸 Booking appointment with data:', appointmentData); // 🌸 ADDED: Debug log

      this.apiService.bookAppointment(appointmentData).subscribe(
        (data) => {
          console.log('🌸 Appointment booked successfully:', data); // 🌸 ADDED: Debug log
          this.successMessage = 'Appointment booked successfully';
          this.errorMessage = '';
          this.loadAppointments(); // Reload appointments after booking
          
          this.resetForm();
          // 🌸 ADDED: Clear message after 3 seconds
          setTimeout(() => this.successMessage = '', 10000);
        },
        (error) => {
          console.error('🌸 Appointment booking error:', error); // 🌸 ENHANCED: Error log
          this.errorMessage = 'Appointment booking failed. Please try again.';
          this.successMessage = '';
          // 🌸 ADDED: Clear message after 5 seconds
          setTimeout(() => this.errorMessage = '', 10000);
        }
      );
    } else {
      // 🌸 ADDED: Validation message
      this.errorMessage = 'Please fill in all required fields';
      setTimeout(() => this.errorMessage = '', 3000);
    }
  }

  // 🌸 FIXED: This method is called when date changes
  loadTimeSlots() {
    console.log('🌸 Date changed - loading time slots for date:', this.newAppointment.date, 'doctor:', this.newAppointment.doctor);

    if (!this.newAppointment.date) {
      console.warn('🌸 Date not selected, showing all time slots');
      this.availableTimeSlots = [...this.TIME_SLOTS]; // 🌸 FIXED: Show all slots when no date
      return;
    }

    if (this.newAppointment.doctor) {
      // 🌸 FIXED: Both date and doctor selected, get filtered slots
      this.loadAvailableSlots();
    } else {
      // 🌸 FIXED: Only date selected, show all slots
      console.log('🌸 No doctor selected yet, showing all time slots');
      this.availableTimeSlots = [...this.TIME_SLOTS];
    }
  }

  // 🌸 NEW: Method to handle doctor selection change
  onDoctorChange() {
    console.log('🌸 Doctor changed to:', this.newAppointment.doctor);
    if (this.newAppointment.date && this.newAppointment.doctor) {
      this.loadAvailableSlots();
    }
  }

  // 🆕 UPDATED: Added appointmentType reset to resetForm method
  resetForm() {
    this.newAppointment = {
      id: 0,
      patient: this.newAppointment.patient, // 🌸 FIXED: Keep patient ID
      date: '',
      time: '',
      doctor: '',
      appointmentType: '' // 🆕 ADDED: Reset appointment type
    };
    this.availableTimeSlots = [...this.TIME_SLOTS]; // 🌸 FIXED: Reset to all slots
  }
}