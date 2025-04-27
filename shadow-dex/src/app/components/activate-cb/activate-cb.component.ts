import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, Subscription } from 'rxjs';
import { WalletService } from '../../services/wallet.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-activate-cb',
  templateUrl: './activate-cb.component.html',
  styleUrls: ['./activate-cb.component.scss']
})
export class ActivateCbComponent implements OnInit, OnDestroy {
  isWalletConnected = false;
  tokens: any[] = [];
  selectedToken: any = null;
  isLoading = false;
  configureForm: FormGroup;
  isConfiguring = false;
  hasConfigured = false;
  errorMessage: string | null = null;
  
  private walletSubscription: Subscription = new Subscription();

  constructor(
    private walletService: WalletService,
    private tokenService: TokenService,
    private fb: FormBuilder
  ) {
    this.configureForm = this.fb.group({
      token: ['']
    });
  }

  ngOnInit(): void {
    this.walletSubscription = this.walletService.walletConnected$.subscribe(
      connected => {
        this.isWalletConnected = connected;
        if (connected) {
          this.loadTokens();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }

  async connectWallet(): Promise<void> {
    this.isLoading = true;
    try {
      await this.walletService.connectWallet();
      // The subscription will handle setting isWalletConnected
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.errorMessage = 'Failed to connect wallet. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadTokens(): Promise<void> {
    if (!this.isWalletConnected) return;
    
    this.isLoading = true;
    try {
      this.tokens = await this.tokenService.getToken2022Tokens();
    } catch (error) {
      console.error('Failed to load tokens:', error);
      this.errorMessage = 'Failed to load tokens. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  onTokenSelect(token: any): void {
    this.selectedToken = token;
    this.configureForm.get('token')?.setValue(token.mintAddress);
  }

  async activateConfidentialBalances(): Promise<void> {
    if (!this.selectedToken) {
      this.errorMessage = 'Please select a token first.';
      return;
    }

    this.isConfiguring = true;
    this.errorMessage = null;
    
    try {
      await this.tokenService.activateConfidentialExtension(this.selectedToken.mintAddress);
      this.hasConfigured = true;
    } catch (error) {
      console.error('Failed to activate confidential balances:', error);
      this.errorMessage = 'Failed to activate confidential balances. Please try again.';
    } finally {
      this.isConfiguring = false;
    }
  }
}