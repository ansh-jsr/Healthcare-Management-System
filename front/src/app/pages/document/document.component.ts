import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MedicalRecord {
  id: number;
  patientName: string;
  patientId: string;
  documentName: string;
  documentType: string;
  uploadDate: Date;
  status: 'approved' | 'rejected';
  patientResponse?: string;
  responseDate?: Date;
}

@Component({
  selector: 'app-medical-records-status',
  templateUrl: './document.component.html', // Fixed template path
  styleUrls: ['./document.component.css'], // Fixed style path
  standalone: true, // Added for modern Angular
  imports: [CommonModule] // Added required imports
})
export class DocumentComponent implements OnInit {
  activeTab: string = 'approved';
  medicalRecords: MedicalRecord[] = [];
  approvedRecords: MedicalRecord[] = [];
  rejectedRecords: MedicalRecord[] = [];
  loading: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  // TrackBy function for better performance
  trackByRecordId(index: number, record: MedicalRecord): number {
    return record.id;
  }

  // Method to switch between tabs
  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  // Load medical records from service/API
  loadMedicalRecords(): void {
    this.loading = true;
    
    // Mock data for demonstration
    setTimeout(() => {
      this.medicalRecords = [
        {
          id: 1,
          patientName: 'John Smith',
          patientId: 'P001',
          documentName: 'Blood Test Report',
          documentType: 'Lab Report',
          uploadDate: new Date('2024-01-15'),
          status: 'approved',
          responseDate: new Date('2024-01-16')
        },
        {
          id: 2,
          patientName: 'Sarah Johnson',
          patientId: 'P002',
          documentName: 'X-Ray Results',
          documentType: 'Imaging',
          uploadDate: new Date('2024-01-14'),
          status: 'approved',
          responseDate: new Date('2024-01-15')
        },
        {
          id: 3,
          patientName: 'Mike Wilson',
          patientId: 'P003',
          documentName: 'Prescription Record',
          documentType: 'Prescription',
          uploadDate: new Date('2024-01-13'),
          status: 'rejected',
          //patientResponse: 'Information seems incorrect - patient details do not match our records',
          responseDate: new Date('2024-01-14')
        },
        {
          id: 4,
          patientName: 'Emily Davis',
          patientId: 'P004',
          documentName: 'MRI Scan',
          documentType: 'Imaging',
          uploadDate: new Date('2024-01-12'),
          status: 'rejected',
          //patientResponse: 'Wrong patient information - please verify patient ID',
          responseDate: new Date('2024-01-13')
        },
        {
          id: 5,
          patientName: 'Robert Brown',
          patientId: 'P005',
          documentName: 'Consultation Notes',
          documentType: 'Clinical Notes',
          uploadDate: new Date('2024-01-11'),
          status: 'approved',
          responseDate: new Date('2024-01-12')
        }
      ];
      this.filterRecords();
      this.loading = false;
    }, 1000);
  }

  // Filter records based on status
  filterRecords(): void {
    this.approvedRecords = this.medicalRecords.filter(record => record.status === 'approved');
    this.rejectedRecords = this.medicalRecords.filter(record => record.status === 'rejected');
  }

  // Download/View document
  viewDocument(record: MedicalRecord): void {
    console.log('Viewing document:', record.documentName);
    // You can implement modal opening, file download, or navigation logic here
    alert(`Opening document: ${record.documentName} for patient ${record.patientName}`);
  }

  // Refresh records
  refreshRecords(): void {
    this.loadMedicalRecords();
  }

  // Format date for display
  formatDate(date: Date): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get status badge class (utility method)
  getStatusBadgeClass(status: string): string {
    return status === 'approved' ? 'status-approved' : 'status-rejected';
  }
}