import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { ApiService } from '../../services/api.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-medical-record-upload',
  templateUrl: './upload.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./upload.component.css']
})
export class UploadRecordComponent implements OnInit {
  uploadForm: FormGroup;
  currentDate: string;
  selectedFile: File | null = null;
  loading = false;
  success = false;
  error = '';
  successMessage = '';
  selectedPatient: any = null;
  appointmentId: string | null = null;
  patientName: string = '';
  patientId: string = '';
  patients: any[] = []; // Add this property

  constructor(
    private fb: FormBuilder, 
    private patientService: PatientService, 
    private apiService: ApiService, 
    private router: Router,
    private route: ActivatedRoute // Add ActivatedRoute to get query parameters
  ) {
    // Format current date as YYYY-MM-DD for HTML date input
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.currentDate = `${year}-${month}-${day}`;
    
    this.uploadForm = this.fb.group({
      patient: ['', Validators.required],
      recordType: ['', Validators.required],
      recordDate: [this.currentDate, Validators.required],
      title: ['', Validators.required],
      description: [''],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    // Get query parameters
    this.route.queryParams.subscribe(params => {
      this.appointmentId = params['appointmentId'] || null;
      this.patientName = params['patientName'] || '';
      
      console.log('📥 Received query parameters:', {
        appointmentId: this.appointmentId,
        patientName: this.patientName
      });

      // If we have patient information from query params, pre-fill the form
      if (this.patientName) {
        // Disable the patient field and set the value
        this.uploadForm.patchValue({
          patient: this.patientName
        });
        
        // Make the patient field read-only since it's pre-selected
        this.uploadForm.get('patient')?.disable();
        
        console.log('✅ Pre-filled patient field with:', this.patientName);
      }
    });

    // Load patients (still useful for other scenarios)
    this.loadPatients();
  }

  loadPatients(): void {
    // If we already have patient info from query params, we don't need to load all patients
    if (this.patientName) {
      console.log('✅ Patient info already available from query params:', this.patientName);
      return;
    }

    // If you have a method to get all patients, use that instead
    // For now, we'll skip loading patients if we have the patient name from query params
    // You might want to add a getAllPatients() method to your ApiService
    
    // Example: this.apiService.getAllPatients().subscribe({...})
    // Or if you need to get a specific patient by ID:
    // this.apiService.getPatientById(somePatientId).subscribe({...})
    
    console.log('ℹ️ Patient loading skipped - using query parameter data');
  }

  onFileDropped(event: any) {
    event.preventDefault();
    this.processFile(event.dataTransfer.files);
  }

  onFileSelected(event: any) {
    this.processFile(event.target.files);
  }

  processFile(files: FileList) {
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        this.error = 'File size must be less than 50MB';
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 
                           'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Please select a valid file type (PDF, JPG, PNG, DOC, DOCX)';
        return;
      }

      this.selectedFile = file;
      this.uploadForm.patchValue({
        file: this.selectedFile
      });
      this.error = ''; // Clear any previous errors

      console.log('✅ File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  uploadRecord() {
    // Re-enable patient field temporarily for validation
    this.uploadForm.get('patient')?.enable();
    
    if (this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      // Disable patient field again if it was pre-filled
      if (this.patientName) {
        this.uploadForm.get('patient')?.disable();
      }
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.success = false;

    const formValues = this.uploadForm.value;

    const saveRecord = (ipfsUrl: string) => {
      // Use the patient name from form or query params
      const patientValue = formValues.patient || this.patientName;
      
      // Create regular JSON object instead of FormData
      const recordPayload = {
        patientId: patientValue,
        description: formValues.description || '',
        recordUrl: ipfsUrl,
        title: formValues.title,
        recordType: formValues.recordType,
        recordDate: formValues.recordDate,
        appointmentId: this.appointmentId || '' // Always include appointmentId, even if empty
      };

      console.log('📤 Uploading record with data:', recordPayload);

      this.apiService.uploadRecord(recordPayload).subscribe({
        next: (response) => {
          console.log('✅ Record uploaded successfully:', response);
          this.success = true;
          this.loading = false;
          this.successMessage = 'Medical record uploaded successfully and linked to appointment.';
          this.uploadForm.reset();
          // Reset form with current date
          this.uploadForm.patchValue({
            recordDate: this.currentDate
          });
          this.selectedFile = null;
          
      
        },
        error: (err) => {
          console.error('❌ Record upload error:', err);
          this.error = err.error?.message || 'Record upload failed. Please try again.';
          this.loading = false;
        }
      });
    };

    if (this.selectedFile) {
      const fileData = new FormData();
      fileData.append('file', this.selectedFile, this.selectedFile.name);

      console.log('📤 Uploading file to IPFS:', this.selectedFile.name);

      this.patientService.uploadFile(fileData).subscribe({
        next: (res: any) => {
          console.log('✅ File uploaded to IPFS:', res);
          const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.ipfsHash}`;
          saveRecord(ipfsUrl);
        },
        error: (err) => {
          console.error('❌ File upload error:', err);
          this.error = 'File upload to IPFS failed. Please try again.';
          this.loading = false;
        }
      });
    } else {
      this.error = 'Please select a file to upload.';
      this.loading = false;
    }

    // Disable patient field again if it was pre-filled
    if (this.patientName) {
      this.uploadForm.get('patient')?.disable();
    }
  }

  cancel() {
    this.uploadForm.reset();
    // Reset form with current date after cancel
    this.uploadForm.patchValue({
      recordDate: this.currentDate
    });
    
    // If we came from appointments, restore the patient info
    if (this.patientName) {
      this.uploadForm.patchValue({
        patient: this.patientName
      });
      this.uploadForm.get('patient')?.disable();
    }
    
    this.selectedFile = null;
    this.error = '';
    this.success = false;
    
    // Navigate back to appointments
    this.router.navigate(['/dashboard/appointments']);
  }

  // Helper method to get display value for patient field
  getPatientDisplayValue(): string {
    return this.patientName || this.uploadForm.get('patient')?.value || '';
  }
}