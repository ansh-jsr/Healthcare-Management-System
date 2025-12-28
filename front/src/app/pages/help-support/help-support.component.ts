import { Component } from '@angular/core';
// Angular Material modules used in the template
import { sharedImports } from '../../material';
import { ApiService } from '../../services/api.service';
interface Faq {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.css'] ,
  imports: [
    ...sharedImports
  ]
})
export class HelpSupportComponent {
  loading = false;
  success = false;
  
  constructor (private apiService: ApiService) {}
  supportForm: {
    [key: string]: any;
    name: string;
    email: string;
    subject: string;
    category: string;
    message: string;
    attachment: File | null;
  } = {
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
    attachment: null
  };
  

  errors: any = {};

  faqs: Faq[] = [
    {
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the Login page and click on "Forgot Password"...'
    },
    {
      question: 'How can I create a new patient record?',
      answer: 'Navigate to the Patient Records page and click "New Patient"...'
    },
    {
      question: 'How to enable two-factor authentication?',
      answer: 'Go to Settings > Security > Two-factor authentication...'
    },
    {
      question: 'How can I export my patient data?',
      answer: 'Go to Settings > Data Management > Export Patient Data...'
    },
    {
      question: 'How do I add a new medical record for a patient?',
      answer: 'Open the patient profile and click "Add Record"...'
    }
  ];

  handleInputChange(field: string, value: any) {
    this.supportForm[field] = value;

    if (this.errors[field]) {
      delete this.errors[field];
    }

    if (this.success) {
      this.success = false;
    }
  }

  handleFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.supportForm.attachment = file;
    }
  }

  validateForm(): boolean {
    const newErrors: any = {};
    const { name, email, subject, category, message } = this.supportForm;

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!subject.trim()) newErrors.subject = 'Subject is required';
    if (!category.trim()) newErrors.category = 'Category is required';
    if (!message.trim()) newErrors.message = 'Message is required';
    else if (message.length < 10) newErrors.message = 'Message is too short';

    this.errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  submitTicket() {
    if (
      !this.supportForm.name ||
      !this.supportForm.email ||
      !this.supportForm.subject ||
      !this.supportForm.category ||
      !this.supportForm.message
    ) {
      alert('Please fill in all fields.');
      return;
    }

    console.log('Submitting support ticket:', this.supportForm);

    this.loading = true;

    this.apiService.submitSupportTicket(this.supportForm).subscribe({
      next: res => {
        console.log('Support ticket response:', res);
        this.success = true; // ✅ show success card
        setTimeout(() => {
        this.success = false;
        }, 5000);
        this.supportForm = {
          name: '',
          email: '',
          subject: '',
          category: '',
          message: '',
          attachment: null
        };
        this.errors = {};
      this.loading = false;
      },
      error: err => {
        console.error('Support ticket error details:', err);
        alert(`❌ Failed to submit ticket: ${err.message || 'Unknown error'}`);
        this.loading = false;
      }
    });
  }

  
}
