import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-send-notification',
  standalone: true,
  templateUrl: './noti.component.html',
  styleUrls: ['./noti.component.css'],
  imports : [CommonModule, ReactiveFormsModule]
})
export class NotificationComponent {
  notificationForm: FormGroup;
  message = '';
  success = '';
  error = '';

  constructor(private fb: FormBuilder, private apiService: ApiService) {
    this.notificationForm = this.fb.group({
      message: [''],
      receiverEmail: [''],
      sendToAll: [false]
    });
  }

 sendNotification() {
  this.success = '';
  this.error = '';
  this.message = 'Sending...';

  const payload = { ...this.notificationForm.value };
  if (payload.sendToAll) {
    delete payload.receiverEmail; // Omit receiverId if sendToAll
  }

  this.apiService.sendNotification(payload).subscribe({
    next: (res) => {
      this.message = '';
      this.success = res.message;
      this.notificationForm.reset({ sendToAll: false });
    },
    error: (err) => {
      this.message = '';
      this.error =
        err.status === 401
          ? 'Unauthorized: Please log in again'
          : err.status === 403
          ? 'Access denied: Doctor role required'
          : err.error?.error || 'Failed to send notification';
    },
  });
}
}
