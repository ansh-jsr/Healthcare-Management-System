import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../services/api.service';
import { ethers } from 'ethers';

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, MatDivider, MatCardModule, MatButtonModule]
})
export class SignUpComponent {
  name: string = '';
  role: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  specialization: string = '';
  license: string = '';
  walletLoading = false;
  walletAddress = '';
  isSubmitting = false;

  showPassword: boolean = false;
  showSignup: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';

  @Output() closeSignup = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  constructor(private apiService: ApiService) {
    this.checkWalletConnection();
  }

  resetForm() {
    this.name = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.role = '';
    this.specialization = '';
    this.license = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.walletAddress = '';
  }

  switchToLoginEvent() {
    this.switchToLogin.emit();
  }

  hideSignup() {
    this.showSignup = false;
    this.closeSignup.emit();
  }

  // Check if wallet is already connected
  async checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          console.log('Wallet already connected:', this.walletAddress);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }

  // Connect to MetaMask wallet
  async connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      this.errorMessage = 'MetaMask is not installed. Please install MetaMask to connect your wallet.';
      return;
    }

    this.walletLoading = true;
    this.errorMessage = '';

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.successMessage = 'Wallet connected successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        // Setup wallet event listeners
        this.setupWalletListeners();
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      if (error.code === 4001) {
        this.errorMessage = 'Please connect your MetaMask wallet to continue.';
      } else {
        this.errorMessage = 'Failed to connect to MetaMask. Please try again.';
      }
    } finally {
      this.walletLoading = false;
    }
  }

  // Setup wallet event listeners
  private setupWalletListeners() {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          console.log('Account changed to:', this.walletAddress);
        } else {
          this.walletAddress = '';
          this.errorMessage = 'Wallet disconnected. Please connect your wallet.';
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        console.log('Chain changed, reloading...');
        window.location.reload();
      });
    }
  }

  // Disconnect wallet
  disconnectWallet() {
    this.walletAddress = '';
    this.successMessage = 'Wallet disconnected successfully!';
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  // Get wallet balance (optional utility method)
  async getWalletBalance(): Promise<string> {
    if (!this.walletAddress || typeof window.ethereum === 'undefined') {
      return '0';
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(this.walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return '0';
    }
  }

  // Validate form before submission
  private validateForm(): boolean {
    this.errorMessage = '';

    if (!this.name.trim()) {
      this.errorMessage = 'Name is required.';
      return false;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Email is required.';
      return false;
    }

    if (!this.password) {
      this.errorMessage = 'Password is required.';
      return false;
    }

    if (!this.confirmPassword) {
      this.errorMessage = 'Please confirm your password.';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return false;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long.';
      return false;
    }

    if (!this.role) {
      this.errorMessage = 'Please select a role.';
      return false;
    }

    if (!this.walletAddress) {
      this.errorMessage = 'Please connect your MetaMask wallet to continue.';
      return false;
    }

    if (this.role === 'doctor') {
      if (!this.specialization.trim()) {
        this.errorMessage = 'Specialization is required for doctors.';
        return false;
      }
      if (!this.license.trim()) {
        this.errorMessage = 'License number is required for doctors.';
        return false;
      }
    }

    return true;
  }

  // Validate Ethereum address format
  private isValidEthereumAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  onSubmit() {
    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Additional wallet address validation
    if (!this.isValidEthereumAddress(this.walletAddress)) {
      this.errorMessage = 'Invalid wallet address format.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      role: this.role,
      specialization: this.role === 'doctor' ? this.specialization.trim() : undefined,
      license: this.role === 'doctor' ? this.license.trim() : undefined,
      walletAddress: this.walletAddress.toLowerCase(), // Ensure lowercase for consistency
    };

    console.log('Submitting signup data:', { ...userData, password: '[HIDDEN]' });

    this.apiService.signup(userData).subscribe({
      next: (res: any) => {
        console.log('Signup successful:', res);
        this.successMessage = res.message || 'Signup successful! You can now login.';
        this.errorMessage = '';
        
        setTimeout(() => {
          this.switchToLoginEvent();
          this.resetForm();
        }, 3000);
      },
      error: (err: any) => {
        console.error('Signup error:', err);
        this.isSubmitting = false;
        
        // Handle specific error messages from backend
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 400) {
          this.errorMessage = 'Invalid input data. Please check your information.';
        } else if (err.status === 409) {
          this.errorMessage = 'Email or wallet address already registered.';
        } else {
          this.errorMessage = 'Signup failed. Please try again.';
        }
        this.successMessage = '';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Cleanup when component is destroyed
  ngOnDestroy() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }
}