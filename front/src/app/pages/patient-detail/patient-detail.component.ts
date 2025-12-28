import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ApiService } from '../../services/api.service';
import { catchError, of } from 'rxjs';

interface Insurance {
  provider?: string;
  policyNumber?: string;
  expiryDate?: string;
}

interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  contactNumber: string;
  address: string;
  bloodType: string;
  allergies: string[];
  insurance?: Insurance;
  emergencyContact?: EmergencyContact;
  status: string;
  registrationDate: string;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
}

interface MedicalRecord {
  _id: string;
  patient: string;
  appointment: string;
  doctor: string | Doctor;
  recordType: string;
  title: string;
  description?: string;
  fileName?: string | null;
  fileUrl?: string;        // <-- add this
  ipfsHash?: string;  
  recordDate: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}


@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    RouterLink,
  ],
})
export class PatientDetail implements OnInit {
  id: string = '';
  loading = true;
  loadingRecords = false;
  error = '';
  recordsError = '';
  patient: Patient | null = null;
  records: MedicalRecord[] = [];
  tabValue = 0;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private apiService: ApiService
  ) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(): void {
    if (this.id) {
      this.fetchPatientData();
    } else {
      this.error = 'No patient ID provided';
      this.loading = false;
    }
  }

  async fetchPatientData(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      // Use proper error handling with RxJS
      const patientResponse = await this.apiService.getPatientById(this.id)
        .pipe(
          catchError(err => {
            console.error('API Error:', err);
            throw err;
          })
        )
        .toPromise();

      if (!patientResponse) {
        throw new Error('No patient data received');
      }

      // Safely map patient data with null checks
      this.patient = {
        _id: patientResponse._id,
        firstName: patientResponse.firstName || '',
        lastName: patientResponse.lastName || '',
        dateOfBirth: patientResponse.dateOfBirth || patientResponse.dob || '',
        gender: patientResponse.gender || '',
        email: patientResponse.email || '',
        contactNumber: patientResponse.contactNumber || '',
        address: patientResponse.address || '',
        bloodType: patientResponse.bloodType || '',
        allergies: Array.isArray(patientResponse.allergies) ? patientResponse.allergies : [],
        insurance: {
          provider: patientResponse.insurance?.provider || '',
          policyNumber: patientResponse.insurance?.policyNumber || '',
          expiryDate: patientResponse.insurance?.expiryDate || patientResponse.insurance?.expiry || '',
        },
        emergencyContact: {
          name: patientResponse.emergencyContact?.name || '',
          relationship: patientResponse.emergencyContact?.relationship || '',
          phone: patientResponse.emergencyContact?.phone || patientResponse.emergencyContact?.contactNumber || '',
        },
        status: patientResponse.status || 'inactive',
        registrationDate: patientResponse.registrationDate || patientResponse.createdAt || '',
      };

      // Fetch medical records after patient data is loaded
      await this.fetchMedicalRecords();

    } catch (err: any) {
      console.error('Error fetching patient data:', err);
      
      // More specific error messages
      if (err.status === 404) {
        this.error = 'Patient not found';
      } else if (err.status === 0) {
        this.error = 'Unable to connect to server. Please check your connection.';
      } else if (err.status >= 500) {
        this.error = 'Server error. Please try again later.';
      } else {
        this.error = err.message || 'Failed to load patient information. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async fetchMedicalRecords(): Promise<void> {
    try {
      this.loadingRecords = true;
      this.recordsError = '';

      console.log('Fetching medical records for patient:', this.id);
      
      // Add error handling for records API call
      const recordsResponse = await this.apiService.getRecordsByPatient(this.id)
        .pipe(
          catchError(err => {
            console.error('Records API Error:', err);
            if (err.status === 404) {
              // Return empty array if no records found
              return of([]);
            }
            throw err;
          })
        )
        .toPromise();
      
      console.log('Medical records response:', recordsResponse);

      // Handle different response structures
      let recordsArray = [];
      
      if (Array.isArray(recordsResponse)) {
        recordsArray = recordsResponse;
      } else if (recordsResponse && Array.isArray(recordsResponse.records)) {
        recordsArray = recordsResponse.records;
      } else if (recordsResponse && Array.isArray(recordsResponse.data)) {
        recordsArray = recordsResponse.data;
      } else if (recordsResponse && recordsResponse.success && Array.isArray(recordsResponse.data)) {
        recordsArray = recordsResponse.data;
      }

      // Map records with proper error handling
     this.records = recordsArray.map((record: any, index: number) => {
      try {
        return this.mapBackendRecordToInterface(record, index);
      } catch (mapError) {
        console.error('Error mapping record:', record, mapError);
        // Fallback record to satisfy return requirement
        return {
          id: index + 1,
          name: 'Unknown',
          error: true,
        };
      }
    });


      console.log('Processed medical records:', this.records);

    } catch (err: any) {
      console.error('Error fetching medical records:', err);
      
      if (err.status === 404) {
        this.recordsError = '';  // Don't show error for no records found
        this.records = [];
      } else if (err.status === 0) {
        this.recordsError = 'Unable to connect to server to load medical records.';
      } else {
        this.recordsError = 'Failed to load medical records.';
      }
    } finally {
      this.loadingRecords = false;
    }
  }

  // Improved mapping with fallback values
  private mapBackendRecordToInterface(record: any, index: number = 0): MedicalRecord {
  return {
    _id: record._id || `temp-${index}`,
    patient: record.patient || '',
    appointment: record.appointment || '',
    doctor: this.extractDoctorInfo(record.doctor),
    recordType: record.recordType || 'General',
    title: record.title || 'Medical Record',
    description: record.description || '',
    fileName: record.fileName || null,
    recordDate: record.recordDate || new Date().toISOString(),
    createdAt: record.createdAt || new Date().toISOString(),
    updatedAt: record.updatedAt || new Date().toISOString(),
    __v: record.__v || 0,
  };
}
private extractDoctorInfo(doctor: any): string {
  if (!doctor) return 'Unknown Doctor';
  
  // If doctor is populated (object with firstName and lastName)
  if (typeof doctor === 'object' && doctor.firstName && doctor.lastName) {
    return `Dr. ${doctor.firstName} ${doctor.lastName}`;
  }
  
  // If doctor is just an ObjectId string
  if (typeof doctor === 'string') {
    return doctor; // You might want to fetch doctor details separately
  }
  
  return 'Unknown Doctor';
}



  // Add refresh method for records
  refreshRecords(): void {
    this.fetchMedicalRecords();
  }

  handleTabChange(event: any): void {
    this.tabValue = event.index;
    if (event.index === 0 && this.records.length === 0 && !this.loadingRecords && !this.recordsError) {
      this.fetchMedicalRecords();
    }
  }

  handleAddRecord(): void {
    this.router.navigate(['/records/new'], { 
      queryParams: { patientId: this.id },
      state: { patientId: this.id } 
    });
  }

  handleEditPatient(): void {
    this.router.navigate([`/patients/${this.id}/edit`]);
  }

  viewRecordDetails(record: MedicalRecord): void {
    if (record._id && record._id !== `temp-${0}` && !record._id.startsWith('fallback-')) {
      this.router.navigate(['/records', record._id]);
    } else {
      console.warn('Cannot view details for invalid record:', record);
    }
  }

  // Enhanced document viewing with error handling
  viewDocument(record: MedicalRecord): void {
    try {
      if (record.fileUrl) {
        window.open(record.fileUrl, '_blank');
      } else if (record.ipfsHash) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
        window.open(ipfsUrl, '_blank');
      } else {
        console.warn('No document URL available for record:', record);
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  }

  // Enhanced download with error handling
  downloadRecord(record: MedicalRecord): void {
    try {
      if (record.fileUrl) {
        // Create a temporary link for download
        const link = document.createElement('a');
        link.href = record.fileUrl;
        link.download = `${record.title || 'medical-record'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (record.ipfsHash) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${record.ipfsHash}`;
        const link = document.createElement('a');
        link.href = ipfsUrl;
        link.download = `${record.title || 'medical-record'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn('No file available for download:', record);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }

  // Add method to get record type icon
  getRecordTypeIcon(recordType: string): string {
    const iconMap: { [key: string]: string } = {
      'Lab Report': 'science',
      'X-Ray': 'medical_services',
      'Prescription': 'medication',
      'Consultation': 'person',
      'Surgery': 'healing',
      'General': 'description',
      'default': 'folder'
    };
    
    return iconMap[recordType] || iconMap['default'];
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    
    try {
      const birthDate = new Date(dateOfBirth);
      if (isNaN(birthDate.getTime())) {
        return 0;
      }
      
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age < 0 ? 0 : age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 0;
    }
  }
}