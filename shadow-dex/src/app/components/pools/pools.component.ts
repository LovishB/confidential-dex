import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss']
})
export class PoolsComponent implements OnInit, OnDestroy {
  showAddLiquidity = false;
  isWalletConnected = false;
  private walletSubscription: Subscription = new Subscription();
  selectedTokenOneImage = 'assets/images/csol.png';
  selectedTokenTwoImage = 'assets/images/csol.png';
  loading = false;
  loadingMessage = '';
  loadingMessages = [
    "Encrypting your deposit for confidential liquidity-please wait…",
    "Securing your tokens in the confidential pool. Your amounts remain private.",
    "Processing your confidential deposit using zero-knowledge proofs…",
    "Win Rewards in a confidentiality way",
    "Applying cryptographic protection to your liquidity-almost done!"
  ];
  private loadingMsgIndex = 0;
  private loadingMsgInterval: any = null;
  depositResult: any = null;
  depositError: string | null = null;
  
  // Mock data for pools (replace with actual data source)
  pools = [
    { pair: 'ETH/USDC', tvl: '$12.5M', reward: '0.3%' },
    { pair: 'WBTC/USDT', tvl: '$8.2M', reward: '0.25%' },
    { pair: 'SOL/USDC', tvl: '$5.7M', reward: '0.35%' }
    // Add more pool data as needed
  ];

  constructor(private walletService: WalletService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.walletSubscription = this.walletService.walletConnected$.subscribe(
      connected => {
        this.isWalletConnected = connected;
      }
    );
  }

  ngOnDestroy() {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
  }

  async connectWallet() {
    await this.walletService.connectWallet();
  }

  updateTokenOneImage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const newImage = selectedOption.getAttribute('data-image');

    if (newImage) {
      this.selectedTokenOneImage = newImage;
      this.cdr.detectChanges(); // Manually trigger change detection
    } else {
      console.error('No data-image attribute found for the selected option.');
    }
  }

  updateTokenTwoImage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const newImage = selectedOption.getAttribute('data-image');

    if (newImage) {
      this.selectedTokenTwoImage = newImage;
      this.cdr.detectChanges(); // Manually trigger change detection
    } else {
      console.error('No data-image attribute found for the selected option.');
    }
  }

  toggleAddLiquidity() {
    if (!this.isWalletConnected) {
      this.connectWallet();
    } else {
      this.showAddLiquidity = !this.showAddLiquidity;
    }
  }

  handleDeposit() {
    const token1 = (document.getElementById('pool-token-1') as HTMLSelectElement).value;
    const token2 = (document.getElementById('pool-token-2') as HTMLSelectElement).value;
    const amount1 = (document.getElementById('pool-amount-1') as HTMLInputElement).value;
    const amount2 = (document.getElementById('pool-amount-2') as HTMLInputElement).value;

    if (!amount1 || !amount2 || +amount1 <= 0 || +amount2 <= 0) {
      alert('Please enter valid amounts for both tokens');
      return;
    }

    // Token symbol to address mapping
    const tokenAddresses: { [key: string]: string } = {
      cUSDC: 'BgD198WqG42r6FHGFKSA3QPnB7NbSYQB74xGhjHLzUKy',
      cUSDT: '6i5mx6oPf5bJwSuLtZ7p35K4GxJbYzaiFniYTgpBiSmw',
      cSOL: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U',
      cSALE: 'GJChkYoTLcrh2NEeLenZ9JjFzbBwgyjXq1TWdrbUSxZf',
      cMNTL: 'A2ameLz6b3F5MjiQSF4HLEnjHZGZ4jCpkm9B81wSV3to'
    };

    const body = {
      tokenAMintAddress: tokenAddresses[token1],
      tokenBMintAddress: tokenAddresses[token2],
      tokenAAmount: +amount1,
      tokenBAmount: +amount2
    };

    // Start loading popup
    this.loading = true;
    this.loadingMsgIndex = 0;
    this.loadingMessage = this.loadingMessages[this.loadingMsgIndex];
    this.depositResult = null;
    this.depositError = null;
    this.loadingMsgInterval = setInterval(() => {
      this.loadingMsgIndex = (this.loadingMsgIndex + 1) % this.loadingMessages.length;
      this.loadingMessage = this.loadingMessages[this.loadingMsgIndex];
      this.cdr.detectChanges();
    }, 3000);

    fetch('http://localhost:8888/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        this.stopLoading(false); // Don't hide loading, show result
        if (data.success && data.data) {
          this.depositResult = {
            tokenAAmount: data.data.tokenAAmount,
            tokenBAmount: data.data.tokenBAmount,
            tokenAMintAddress: data.data.tokenAMintAddress,
            tokenBMintAddress: data.data.tokenBMintAddress,
            signatureA: data.data.signatureTokenATransfer,
            signatureB: data.data.signatureTokenBTransfer
          };
        } else {
          this.depositError = data.message || 'Deposit failed';
        }
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.stopLoading();
        this.depositError = 'Deposit failed: ' + err.message;
        this.cdr.detectChanges();
      });
  }

  stopLoading(hide: boolean = true) {
    if (this.loadingMsgInterval) {
      clearInterval(this.loadingMsgInterval);
      this.loadingMsgInterval = null;
    }
    if (hide) {
      this.loading = false;
    }
    this.cdr.detectChanges();
  }

  closeDepositResult() {
    this.loading = false;
    this.depositResult = null;
    this.depositError = null;
    this.cdr.detectChanges();
  }
}