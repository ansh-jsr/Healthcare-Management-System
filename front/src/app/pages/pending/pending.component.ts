import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorName: string;
  documentName: string;
  documentType: string;
  uploadDate: Date;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  pdfPath?: string;
  rejectionReason?: string;
  approvedDate?: Date;
  rejectedDate?: Date;
}

@Component({
  selector: 'app-medical-records',
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PendingRecordsComponent implements OnInit {
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  allRecords: MedicalRecord[] = [];
  isLoading = false;
  showRejectDialog = false;
  selectedRecord: MedicalRecord | null = null;
  rejectionReason = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  // Getters for filtered records
  get pendingRecords(): MedicalRecord[] {
    return this.allRecords.filter(record => record.status === 'pending');
  }

  get approvedRecords(): MedicalRecord[] {
    return this.allRecords.filter(record => record.status === 'approved');
  }

  get rejectedRecords(): MedicalRecord[] {
    return this.allRecords.filter(record => record.status === 'rejected');
  }

  // Load medical records from API
  loadMedicalRecords(): void {
    this.isLoading = true;
    this.http.get<MedicalRecord[]>('/api/medical-records/patient')
      .subscribe({
        next: (records) => {
          this.allRecords = records.map(record => ({
            ...record,
            uploadDate: new Date(record.uploadDate)
          }));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading medical records:', error);
          this.isLoading = false;
          // Load mock data for demo
          this.loadMockData();
        }
      });
  }

  // Mock data for demonstration
  loadMockData(): void {
    this.allRecords = [
      {
        id: '1',
        patientId: 'PAT001',
        doctorName: 'Smith',
        documentName: 'Blood Test Results',
        documentType: 'Lab Report',
        uploadDate: new Date('2024-01-15'),
        description: 'Complete blood count and metabolic panel results',
        status: 'pending',
        pdfPath: '/documents/blood-test-001.pdf'
      },
      {
        id: '2',
        patientId: 'PAT001',
        doctorName: 'Johnson',
        documentName: 'X-Ray Report',
        documentType: 'Radiology',
        uploadDate: new Date('2024-01-10'),
        description: 'Chest X-ray examination',
        status: 'approved',
        approvedDate: new Date('2024-01-12'),
        pdfPath: '/documents/xray-002.pdf'
      },
      {
        id: '3',
        patientId: 'PAT001',
        doctorName: 'Davis',
        documentName: 'Prescription',
        documentType: 'Medication',
        uploadDate: new Date('2024-01-08'),
        description: 'Antibiotic prescription for infection',
        status: 'rejected',
        rejectedDate: new Date('2024-01-09'),
        rejectionReason: 'Incorrect dosage mentioned',
        pdfPath: '/documents/prescription-003.pdf'
      }
    ];
  }

  // Set active tab
  setActiveTab(tab: 'pending' | 'approved' | 'rejected'): void {
    this.activeTab = tab;
  }

  // View document
  viewDocument(record: MedicalRecord): void {
    if (record.pdfPath) {
      window.open(record.pdfPath, '_blank');
    } else {
      alert('Document not available');
    }
  }

  // Approve medical record
  approveRecord(record: MedicalRecord): void {
    this.isLoading = true;
    
    const updateData = {
      id: record.id,
      status: 'approved',
      approvedDate: new Date()
    };

    this.http.put(`/api/medical-records/${record.id}/approve`, updateData)
      .subscribe({
        next: () => {
          // Update local record
          const index = this.allRecords.findIndex(r => r.id === record.id);
          if (index !== -1) {
            this.allRecords[index].status = 'approved';
            this.allRecords[index].approvedDate = new Date();
          }
          this.isLoading = false;
          this.showSuccessMessage('Medical record approved successfully');
        },
        error: (error) => {
          console.error('Error approving record:', error);
          this.isLoading = false;
          this.showErrorMessage('Failed to approve medical record');
        }
      });
  }

  // Show reject modal
  showRejectModal(record: MedicalRecord): void {
    this.selectedRecord = record;
    this.rejectionReason = '';
    this.showRejectDialog = true;
  }

  // Reject medical record
  rejectRecord(): void {
    if (!this.selectedRecord || !this.rejectionReason.trim()) {
      this.showErrorMessage('Please provide a reason for rejection');
      return;
    }

    this.isLoading = true;
    
    const updateData = {
      id: this.selectedRecord.id,
      status: 'rejected',
      rejectedDate: new Date(),
      rejectionReason: this.rejectionReason.trim()
    };

    this.http.put(`/api/medical-records/${this.selectedRecord.id}/reject`, updateData)
      .subscribe({
        next: () => {
          // Update local record
          const index = this.allRecords.findIndex(r => r.id === this.selectedRecord!.id);
          if (index !== -1) {
            this.allRecords[index].status = 'rejected';
            this.allRecords[index].rejectedDate = new Date();
            this.allRecords[index].rejectionReason = this.rejectionReason.trim();
          }
          this.isLoading = false;
          this.closeRejectModal();
          this.showSuccessMessage('Medical record rejected successfully');
        },
        error: (error) => {
          console.error('Error rejecting record:', error);
          this.isLoading = false;
          this.showErrorMessage('Failed to reject medical record');
        }
      });
  }

  // Close reject modal
  closeRejectModal(): void {
    this.showRejectDialog = false;
    this.selectedRecord = null;
    this.rejectionReason = '';
  }

  // Utility methods for notifications
  private showSuccessMessage(message: string): void {
    // You can replace this with your preferred notification service
    alert(message);
  }

  private showErrorMessage(message: string): void {
    // You can replace this with your preferred notification service
    alert(message);
  }

  // Format date for display
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-badge pending';
      case 'approved': return 'status-badge approved';
      case 'rejected': return 'status-badge rejected';
      default: return 'status-badge';
    }
  }
}