import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Angular Material modules used in the template
import { sharedImports } from '../../material';
import {CommonModule} from '@angular/common';
import { ApiService } from '../../services/api.service';
@Component({
  selector: 'app-profile-page',
  standalone: true,
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'],
  imports: [
    ...sharedImports ,
    CommonModule
  ]
})
export class ProfilePageComponent implements OnInit {
  
  loading: boolean = true;
  user: any = null;

  tabValue: number = 0;
  isEditMode: boolean = false;

  profileForm = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    specialization: '',
    licenseNumber: '' ,
    memberSince: ''
  };

  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  profileErrors: any = {};
  passwordErrors: any = {};

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  error: string | null = null;
  success: string | null = null;

constructor( private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchUserData();
  }

  fetchUserData(): void {
    this.loading = true;
    this.apiService.getCurrentUser().subscribe({
      next: (res) => {
        this.user = res.user || res;

        this.profileForm = {
          firstName: this.user.firstName || '',
          lastName: this.user.lastName || '',
          email: this.user.email || '',
          role: this.user.role || '',
          specialization: this.user.specialization || '',
          licenseNumber: this.user.license || '',
          memberSince: new Date(this.user.memberSince).toLocaleDateString() || '',
        };

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to fetch user data.';
        this.loading = false;
      }
    });
  }


  editProfile(): void {
    this.isEditMode = true;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.clearErrors();
    // Reset form to original user data
    this.profileForm = { ...this.user };
  }

  saveChanges(): void {
  this.clearErrors();
  this.loading = true;

  const userId = this.user._id || localStorage.getItem('userId');
  if (!userId) {
    this.error = 'User ID not found';
    this.loading = false;
    return;
  }

  const errors = this.validateProfileForm();
  if (Object.keys(errors).length) {
    this.profileErrors = errors;
    this.loading = false;
    return;
  }

  // Assuming you are passing userId as part of the data
 this.apiService.updateUser(userId, this.profileForm).subscribe({
  next: (res) => {
    console.log('Success response:', res);
    if (res.user) {
      this.user = res.user;
       this.profileForm = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        role: this.user.role || '',
        specialization: this.user.specialization || '',
        licenseNumber: this.user.license || '',
        memberSince: new Date(this.user.memberSince).toLocaleDateString() || '',
      };
    } else if (res.updated) {
      this.user = res.updated;
      this.profileForm = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        email: this.user.email || '',
        role: this.user.role || '',
        specialization: this.user.specialization || '',
        licenseNumber: this.user.license || '',
        memberSince: new Date(this.user.memberSince).toLocaleDateString() || '',
      };
    }

    this.success = 'Profile updated successfully!';
    this.error = '';
    this.isEditMode = false;
    this.loading = false;
  },
  error: (err) => {
    this.success = 'Profile updated successfully!';
    
    this.loading = false;
  }
});

}


  handleChangePassword(): void {
    this.clearErrors();
    this.loading = true;

     const errors = this.validatePasswordForm();
    if (Object.keys(errors).length) {
      this.passwordErrors = errors;
      this.loading = false;
      return;
    }

    const passwordData = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    };

    this.apiService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.success = 'Password changed successfully!';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Password change error:', err);
        this.error = err.error?.message || 'Failed to change password.';
        this.loading = false;
      }
    });
  }

  validateProfileForm(): any {
    const errors: any = {};
    if (!this.profileForm.firstName) errors.firstName = 'First name is required.';
    if (!this.profileForm.lastName) errors.lastName = 'Last name is required.';
    if (!this.profileForm.email) errors.email = 'Email is required.';

    if (this.profileForm.role === 'doctor' && !this.profileForm.specialization) {
      errors.specialization = 'Specialization is required for doctors.';
    }

    if (['doctor', 'nurse'].includes(this.profileForm.role) && !this.profileForm.licenseNumber) {
      errors.licenseNumber = 'License number is required.';
    }

    return errors;
  }

  validatePasswordForm(): any {
    const errors: any = {};
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!currentPassword) errors.currentPassword = 'Current password is required.';
    if (!newPassword) errors.newPassword = 'New password is required.';
    if (!confirmPassword) errors.confirmPassword = 'Confirm your new password.';

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
  }

  togglePasswordVisibility(type: 'current' | 'new' | 'confirm'): void {
    if (type === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (type === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (type === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  clearErrors(): void {
    this.profileErrors = {};
    this.passwordErrors = {};
    this.error = null;
    this.success = null;
  }
}