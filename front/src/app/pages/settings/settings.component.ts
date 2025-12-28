import { Component, OnInit ,OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { sharedImports } from '../../material';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [...sharedImports],
})
export class SettingsComponent implements OnInit {
  loading = false;
  success = false;

  settingsForm: FormGroup;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.settingsForm = this.fb.group({
      // Notification settings
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true],

      // Privacy settings
      showProfileToOthers: [true],
      shareActivityData: [false],

      // Security settings
      twoFactorAuth: [false],

      // Display settings
      language: ['en'],
      theme: ['light'],

      // Data settings
      autoBackup: [true],
      dataRetention: [90]
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.applyTheme(this.settings.theme);
  }

  ngOnDestroy() {
    // Clean up any subscriptions or event listeners if necessary
  }

  loadSettings() {
    this.api.getSettings().subscribe({
      next: (data: any) => {
        this.settingsForm.patchValue(data);
        this.applyTheme(data.theme); // Ensure the theme is applied when settings are loaded
      },
      error: err => console.error('Failed to load settings:', err)
    });
  }

  handleToggleChange(event: any): void {
    const { name, checked } = event.target;
    this.settingsForm.get(name)?.setValue(checked);
    if (this.success) this.success = false;
  }

  handleInputChange(event: any): void {
    const { name, value } = event.target;
    this.settingsForm.get(name)?.setValue(value);
    if (this.success) this.success = false;

    if (name === 'theme') {
      this.applyTheme(value); // Apply the theme when it is changed
    }
  }


  handleSaveSettings(): void {
    this.loading = true;
    this.api.saveSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: (err:any) => {
        console.error('Error saving settings:', err);
        this.loading = false;
      }
    });
  }

  get settings() {
    return this.settingsForm.value;
  }

  private applyTheme(theme: string): void {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}
