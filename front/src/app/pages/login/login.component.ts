import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ethers } from 'ethers';

// Declare ethereum on window to avoid TypeScript errors
declare global {
  interface Window {
    ethereum?: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    FormsModule, 
    CommonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatButtonModule,
    MatDividerModule
  ]
})
export class LoginComponent implements OnDestroy {
  // Traditional login fields
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isSubmitting: boolean = false;

  // Wallet login fields
  walletAddress: string = '';
  isConnecting: boolean = false;
  isWalletAuthenticating: boolean = false;

  // UI state
  showLogin: boolean = true;
  successMessage: string = '';
  errorMessage: string = '';
  loginMethod: 'password' | 'wallet' = 'password';

  @Output() closeLogin = new EventEmitter<void>();
  @Output() switchToSignup = new EventEmitter<void>();

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    // Check if wallet is already connected on component init
    this.checkExistingConnection();
  }

  // Check if MetaMask is already connected
  async checkExistingConnection() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.walletAddress = accounts[0];
          console.log('Wallet already connected:', this.walletAddress);
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    }
  }

  switchToSignupEvent() {
    this.switchToSignup.emit();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  hideLogin() {
    this.showLogin = false;
    this.closeLogin.emit();
  }

  // Switch between login methods
  setLoginMethod(method: 'password' | 'wallet') {
    this.loginMethod = method;
    this.clearMessages();
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Connect to MetaMask
  async connectMetaMask() {
    this.clearMessages();

    try {
      this.isConnecting = true;

      // Check if running in browser environment
      if (typeof window === 'undefined') {
        this.errorMessage = 'MetaMask can only be used in a browser environment.';
        return;
      }

      // Check if MetaMask is installed
      if (!window.ethereum) {
        this.errorMessage = 'MetaMask is not installed. Please install MetaMask extension.';
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      // Check if MetaMask is the provider
      if (!window.ethereum.isMetaMask) {
        this.errorMessage = 'Please make sure MetaMask is your default wallet.';
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        this.errorMessage = 'No accounts found. Please unlock MetaMask.';
        return;
      }

      this.walletAddress = accounts[0];
      this.successMessage = 'Wallet connected successfully!';

      // Setup MetaMask listeners
      this.setupMetaMaskListeners();

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);

    } catch (error: any) {
      console.error('MetaMask connection error:', error);

      // Handle specific error cases
      if (error.code === 4001) {
        this.errorMessage = 'Connection rejected by user.';
      } else if (error.code === -32002) {
        this.errorMessage = 'MetaMask is already processing a request. Please wait.';
      } else {
        this.errorMessage = 'Failed to connect MetaMask. Please try again.';
      }
    } finally {
      this.isConnecting = false;
    }
  }

  // Authenticate with wallet (with optional signature verification)
  async authenticateWithWallet() {
    if (!this.walletAddress) {
      this.errorMessage = 'Please connect your wallet first.';
      return;
    }

    this.isWalletAuthenticating = true;
    this.clearMessages();

    try {
      // Optional: Create a message to sign for enhanced security
      const message = `Login to HealthApp at ${new Date().toISOString()}`;
      let signature = '';

      try {
        // Request signature from user (optional for enhanced security)
        signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, this.walletAddress]
        });
        console.log('Message signed successfully');
      } catch (signError) {
        console.log('User declined to sign message, proceeding without signature');
        // Continue without signature - your backend supports this
      }

      // Prepare authentication data
      const authData: any = {
        walletAddress: this.walletAddress
      };

      // Include signature if available
      if (signature) {
        authData.signature = signature;
        authData.message = message;
      }

      console.log('Authenticating with wallet:', this.walletAddress);

      // Call wallet authentication endpoint
      this.apiService.walletAuth(authData).subscribe({
        next: (res: any) => {
          console.log('Wallet authentication successful:', res);
          this.successMessage = 'Login successful! Redirecting...';
          this.errorMessage = '';

          // Store user data
          this.apiService.storeUserData(res.token, res.user);

          // Navigate to dashboard
          setTimeout(() => {
            const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
            this.router.navigate([returnUrl]);
          }, 1500);
        },
        error: (err: any) => {
          console.error('Wallet authentication error:', err);
          
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.status === 404) {
            this.errorMessage = 'No account found with this wallet address. Please register first.';
          } else if (err.status === 401) {
            this.errorMessage = 'Invalid wallet signature. Please try again.';
          } else {
            this.errorMessage = 'Wallet authentication failed. Please try again.';
          }
          this.successMessage = '';
        },
        complete: () => {
          this.isWalletAuthenticating = false;
        }
      });

    } catch (error: any) {
      console.error('Wallet authentication process error:', error);
      this.errorMessage = 'Failed to authenticate with wallet. Please try again.';
      this.isWalletAuthenticating = false;
    }
  }

  // Setup listeners for MetaMask events
  private setupMetaMaskListeners() {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          this.walletAddress = '';
          this.errorMessage = 'Wallet disconnected.';
          this.successMessage = '';
        } else {
          // User switched accounts
          this.walletAddress = accounts[0];
          this.successMessage = 'Account switched successfully!';
          this.errorMessage = '';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', (chainId: string) => {
        console.log('Chain changed to:', chainId);
        // Optionally reload the page or update UI based on network
      });

      // Listen for connection
      window.ethereum.on('connect', (connectInfo: any) => {
        console.log('MetaMask connected:', connectInfo);
      });

      // Listen for disconnection
      window.ethereum.on('disconnect', (error: any) => {
        console.log('MetaMask disconnected:', error);
        this.walletAddress = '';
        this.errorMessage = 'Wallet disconnected.';
        this.successMessage = '';
      });
    }
  }

  // Disconnect wallet
  disconnectWallet() {
    this.walletAddress = '';
    this.successMessage = 'Wallet disconnected.';
    this.errorMessage = '';
    
    setTimeout(() => {
      this.successMessage = '';
    }, 2000);
  }

  // Traditional email/password login
  onSubmit() {
    if (!this.email.trim() || !this.password.trim() || !this.walletAddress) {
      this.errorMessage = 'Please enter email ,password and wallet address.';
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    this.apiService.login(this.email.trim(), this.password, this.walletAddress).subscribe({
      next: (res: any) => {
        console.log('Login successful:', res);
        this.successMessage = 'Login successful! Redirecting...';
        this.errorMessage = '';

        // Store user data
        this.apiService.storeUserData(res.token, res.user);

        // Navigate to dashboard
        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        
        if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        this.successMessage = '';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  // Utility method to truncate wallet address for display
  getTruncatedAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }

  // Cleanup listeners when component is destroyed
  ngOnDestroy() {
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.removeAllListeners('connect');
      window.ethereum.removeAllListeners('disconnect');
    }
  }
}