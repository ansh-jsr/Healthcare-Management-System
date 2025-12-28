import { Component } from '@angular/core';
// Angular Material modules used in the template
import { sharedImports } from '../../material';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
interface Faq {
  category: string;
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'] ,
  imports: [
    sharedImports,
    FormsModule
  ]
})
export class FaqComponent {
  tabValue = 0;
  searchTerm = '';
  expandedPanel: string | null = null;

  categories = [
    { label: 'All', icon: 'help' },
    { label: 'Account', icon: 'account_circle' },
    { label: 'Security', icon: 'security' },
    { label: 'Patient Records', icon: 'medical_services' },
    { label: 'Data Management', icon: 'data_usage' },
    { label: 'Billing', icon: 'payment' },
    { label: 'Technical Issues', icon: 'bug_report' },
    { label: 'Settings', icon: 'settings' }
  ];

  faqData = [
    // Account
    {
      category: 'Account',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on the login page. Fill in your details, including your name, email, and password. You\'ll receive a verification email to activate your account.',
    },
    {
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'To reset your password, go to the Login page and click on "Forgot Password". Enter your email address and follow the instructions sent to your email to create a new password.',
    },
    {
      category: 'Account',
      question: 'How can I update my profile information?',
      answer: 'You can update your profile information by going to your Profile page, which can be accessed by clicking on your name in the top right corner of the dashboard. From there, click on "Edit Profile" to make changes to your information.',
    },
    {
      category: 'Account',
      question: 'How do I change my email address?',
      answer: 'To change your email address, go to your Profile page, click on "Edit Profile", and update your email address. You will receive a verification email to confirm the change.',
    },

    // Security
    {
      category: 'Security',
      question: 'How to enable two-factor authentication?',
      answer: 'You can enable two-factor authentication by going to the Settings page, then to the Security tab. Toggle the "Two-factor authentication" switch to on, and follow the setup instructions.',
    },
    {
      category: 'Security',
      question: 'What should I do if I suspect my account has been compromised?',
      answer: 'If you suspect your account has been compromised, immediately change your password, enable two-factor authentication if not already enabled, and contact support. We recommend reviewing your recent activities and reporting any suspicious actions.',
    },
    {
      category: 'Security',
      question: 'How secure is my patient data on the platform?',
      answer: 'We employ industry-standard encryption and security protocols to ensure your data is protected. All data is encrypted at rest and in transit. We regularly perform security audits and comply with healthcare regulations like HIPAA. The blockchain technology also provides an additional layer of security and immutability for transaction records.',
    },
    {
      category: 'Security',
      question: 'How often should I change my password?',
      answer: 'We recommend changing your password every 90 days. However, you should change it immediately if you suspect your account security has been compromised.',
    },

    // Patient Records
    {
      category: 'Patient Records',
      question: 'How can I create a new patient record?',
      answer: 'You can create a new patient record by navigating to the Patient Records page and clicking on the "New Patient" button. Fill in the required information and click "Save Patient" to create the record.',
    },
    {
      category: 'Patient Records',
      question: 'How do I add a new medical record for a patient?',
      answer: 'To add a new medical record, first navigate to the patient\'s profile by clicking on their name in the Patient Records list. Then click on "Add Record" and fill in the required information.',
    },
    {
      category: 'Patient Records',
      question: 'Can I transfer patient records to another provider?',
      answer: 'Yes, you can transfer patient records to another provider. Go to the patient\'s profile, click on "Share Records", select the records to share, enter the recipient provider\'s information, and click "Transfer". The receiving provider must have an account on our platform to receive the transfer.',
    },
    {
      category: 'Patient Records',
      question: 'How can I search for a specific patient record?',
      answer: 'You can search for a patient record using the search bar at the top of the Patient Records page. You can search by name, ID number, or date of birth. Advanced filters are also available to narrow down your search.',
    },

    // Data Management
    {
      category: 'Data Management',
      question: 'How can I export my patient data?',
      answer: 'To export patient data, go to the Settings page, then to the Data Management section. Click on the "Export Patient Data" option and select your preferred format (CSV or PDF).',
    },
    {
      category: 'Data Management',
      question: 'Can I import patient records from another system?',
      answer: 'Yes, you can import patient records from another system. Go to the Data Management section in Settings, select "Import Data", choose the file format, and upload your file. We support imports from most common healthcare systems and formats including CSV, HL7, and FHIR.',
    },
    {
      category: 'Data Management',
      question: 'How long is patient data stored in the system?',
      answer: 'Patient data is stored indefinitely unless specifically deleted by an authorized user. We maintain backup copies of all data in accordance with healthcare regulations, typically for a minimum of 7 years after the last patient interaction.',
    },
    {
      category: 'Data Management',
      question: 'What happens to patient data if I close my account?',
      answer: 'If you close your account, patient data will remain in the system if you are part of a practice or organization. If you are an individual provider, you will be prompted to transfer or export patient data before closing your account, in accordance with healthcare regulations.',
    },

    // Billing
    {
      category: 'Billing',
      question: 'How do I update my billing information?',
      answer: 'To update your billing information, go to the Settings page, then select "Billing & Subscription". Click on "Update Payment Method" to change your credit card or payment details.',
    },
    {
      category: 'Billing',
      question: 'What payment methods are accepted?',
      answer: 'We accept most major credit cards (Visa, Mastercard, American Express, Discover), as well as PayPal for monthly and annual subscriptions.',
    },
    {
      category: 'Billing',
      question: 'How can I get an invoice for my subscription?',
      answer: 'Invoices are automatically generated and emailed to your account email address. You can also view and download all past invoices by going to Settings > Billing & Subscription > Billing History.',
    },
    {
      category: 'Billing',
      question: 'Can I change my subscription plan?',
      answer: 'Yes, you can change your subscription plan at any time by going to Settings > Billing & Subscription > Change Plan. If you upgrade, the new rate will be prorated for the remainder of your billing cycle. If you downgrade, the new rate will take effect on your next billing date.',
    },

    // Technical Issues
    {
      category: 'Technical Issues',
      question: 'What browsers are supported?',
      answer: 'Our platform supports the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to ensure optimal performance and security.',
    },
    {
      category: 'Technical Issues',
      question: 'The application is running slowly. What can I do?',
      answer: 'If the application is running slowly, try clearing your browser cache, ensuring you have a stable internet connection, and closing other resource-intensive applications. If problems persist, please contact our support team.',
    },
    {
      category: 'Technical Issues',
      question: 'I\'m having trouble logging in. What should I do?',
      answer: 'If you\'re having trouble logging in, first ensure you\'re using the correct email and password. Try resetting your password using the "Forgot Password" link. Clear your browser cache or try using a different browser. If problems persist, contact our support team.',
    },
    {
      category: 'Technical Issues',
      question: 'Can I use the application on mobile devices?',
      answer: 'Yes, our application is fully responsive and works on mobile devices and tablets. We also offer dedicated mobile apps for iOS and Android for an optimized mobile experience.',
    },

    // Settings
    {
      category: 'Settings',
      question: 'How do I change the language of the interface?',
      answer: 'To change the language, go to Settings > Display > Language and select your preferred language from the dropdown menu. Currently, we support English, Spanish, French, German, and Japanese.',
    },
    {
      category: 'Settings',
      question: 'Can I customize the dashboard view?',
      answer: 'Yes, you can customize your dashboard by going to Settings > Display > Dashboard Customization. You can choose which widgets to display, their arrangement, and color themes.',
    },
    {
      category: 'Settings',
      question: 'How do I set up notifications?',
      answer: 'To set up notifications, go to Settings > Notifications. You can choose which events trigger notifications and your preferred notification methods (in-app, email, or mobile push notifications).',
    },
    {
      category: 'Settings',
      question: 'How can I change my time zone settings?',
      answer: 'To change your time zone, go to Settings > Display > Time Zone and select your correct time zone from the dropdown menu. This will ensure all dates and times display correctly for your location.',
    }
  ];

  constructor(private apiService: ApiService) {}

  onSearchInput() {
    // Simply allow the searchTerm to update and let filteredFAQs handle filtering
    // No need to call changeTab(0) here
  }

  // Trigger search when the search button is clicked
  triggerSearch() {
    // The filteredFAQs getter already uses searchTerm, so no additional logic is needed
    // Optionally, you can add logic to ensure the search is applied to the current tab
    this.tabValue = this.tabValue; // Trigger change detection if needed
  }

  get filteredFAQs() {
    return this.faqData.filter(faq => {
      const matchesSearch =
        !this.searchTerm ||
        faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory =
        this.tabValue === 0 || faq.category === this.categories[this.tabValue].label;
      return matchesSearch && matchesCategory;
    });
  }

  get popularQuestions() {
    const tracker = new Set();
    return this.faqData.filter(faq => {
      if (!tracker.has(faq.category)) {
        tracker.add(faq.category);
        return true;
      }
      return false;
    }).slice(0, 5);
  }

  changeTab(index: number) {
    this.tabValue = index;
    this.searchTerm = '';
    this.expandedPanel = null;
  }

  clearSearch() {
    this.searchTerm = '';
    this.expandedPanel = null;
  }

  togglePanel(panelId: string) {
    this.expandedPanel = this.expandedPanel === panelId ? null : panelId;
  }

  goToPopular(faq: any) {
    const index = this.categories.findIndex(cat => cat.label === faq.category);
    this.tabValue = index > 0 ? index : 0;
    const questionIndex = this.filteredFAQs.findIndex(q => q.question === faq.question);
    this.expandedPanel = `panel-${questionIndex}`;
  }
  getFaqCountByCategory(categoryLabel: string): number {
    return this.faqData.filter(f => f.category === categoryLabel).length;
  }
  

}
