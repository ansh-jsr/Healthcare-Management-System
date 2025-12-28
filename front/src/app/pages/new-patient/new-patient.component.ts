import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { sharedImports } from '../../material';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-new-patient',
  standalone: true,
  templateUrl: './new-patient.component.html',
  styleUrls: ['./new-patient.component.css'],
  imports: [
    ...sharedImports
  ]
})
export class NewPatientComponent {
  form: FormGroup;
  loading = false;
  success = false;
  error = '';
  successMessage: string = '';
  selectedFile: File | null = null;

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private PatientService: PatientService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      address: ['', Validators.required],
      bloodType: ['',Validators.required],
      allergies: [''],
      insuranceprovider: [''],
      insurancepolicyNumber: [''],
      insuranceexpiryDate: [''],
      emergencyContactname: [''],
      emergencyContactrelationship: [''],
      emergencyContactphone: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  submitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    const patientData = this.form.value;

    const savePatient = (medicalFileUrl: string | null = null) => {
      if (medicalFileUrl) {
        patientData.medicalFileUrl = medicalFileUrl;
      }

       const payload = new FormData();
      Object.keys(patientData).forEach(key => {
      if (patientData[key]) {
      payload.append(key, patientData[key]);
      }
      });

      this.PatientService.addPatient(payload).subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
          }, 2000); // Redirect after 2 seconds to show success message
        },
        error: (err: any) => {
          this.error = err.message || 'Something went wrong while creating the patient.';
          this.loading = false;
        }
      });
    };

    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.PatientService.uploadFile(formData).subscribe({
        next: (res: any) => {
          const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.ipfsHash}`;
          savePatient(ipfsUrl);
        },
        error: (err: any) => {
          this.error = 'File upload failed.';
          this.loading = false;
        }
      });
    } else {
      savePatient(); // No file uploaded
    }
  }

  get f() {
    return this.form.controls;
  }
}