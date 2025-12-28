import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { NewPatientComponent } from '../new-patient/new-patient.component';
import { ApiService } from '../../services/api.service';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  contactNumber: string;
  status: string;
  lastVisit: string;
}

@Component({
  selector: 'app-patient-records',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    RouterModule,
    NewPatientComponent
  ],
  templateUrl: './patient-records.component.html',
  styleUrls: ['./patient-records.component.css']
})
export class PatientRecords implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  paginatedPatients: Patient[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  page = 0;
  rowsPerPage = 10;
  // 🟣 Changed 'id' to 'serialNo' in displayed columns
  displayedColumns: string[] = ['serialNo', 'name', 'age', 'gender', 'contact', 'status', 'lastVisit', 'actions'];

  constructor(private router: Router, private apiService: ApiService) {
  }

  ngOnInit() {
    this.fetchPatients();
  }

  fetchPatients() {
    this.loading = true;
    // 🟣 Updated to call the correct backend endpoint that matches the controller
    this.apiService.getAllPatients().subscribe({
      next: (response) => {
        // 🟣 Updated to handle the new response structure from backend
        if (response.success && response.patients) {
          this.patients = response.patients.map((p: any) => ({
            id: p._id,
            firstName: p.firstName,
            lastName: p.lastName,
            dob: p.dob,
            gender: p.gender,
            contactNumber: p.contactNumber,
            status: p.status,
            // 🟣 Added fallback for lastVisit since it's not in the schema
            lastVisit: p.updatedAt || p.createdAt || new Date().toISOString(),
          }));
        } else {
          this.patients = [];
        }
        this.loading = false;
        this.filterAndPaginate();
      },
      error: (err) => {
        this.error = 'Failed to load patients';
        this.loading = false;
        console.error('Error fetching patients:', err);
      }
    });
  }

  onSearchChange() {
    this.page = 0;
    this.filterAndPaginate();
  }

  handlePageEvent(event: PageEvent) {
    this.rowsPerPage = event.pageSize;
    this.page = event.pageIndex;
    this.filterAndPaginate();
  }

  viewPatient(patientId: string) {
    this.router.navigate([`/patient-detail/${patientId}`]);
  }

  filterAndPaginate() {
    this.filteredPatients = this.patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return fullName.includes(this.searchQuery.toLowerCase());
    });
    this.paginatedPatients = this.filteredPatients.slice(
      this.page * this.rowsPerPage,
      this.page * this.rowsPerPage + this.rowsPerPage
    );
    console.log('Filtered Patients:', this.filteredPatients);
    console.log('Paginated Patients:', this.paginatedPatients);
  }

  // 🟣 Enhanced calculateAge method with better error handling and validation
  
// Replace your calculateAge method with this simple one:
calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }


  // 🟣 Added helper method to get serial number based on current page and index
  getSerialNumber(index: number): number {
    return (this.page * this.rowsPerPage) + index + 1;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}