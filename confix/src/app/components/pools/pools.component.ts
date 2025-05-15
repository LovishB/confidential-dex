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
  selectedTokenOneImage = '';
  selectedTokenTwoImage = '';
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
  selectedTokenOne = '';
  selectedTokenTwo = '';
  amount1: number | null = null;
  amount2: number | null = null;
  amount1Invalid = false;
  amount2Invalid = false;
  
  // Default/mock data for pools (used as backup)
  pools = [
    { pair: 'cSOL / cUSDC', tvl: '10000 $', reward: '0.3%' },
    { pair: 'cSOL / cUSDT', tvl: '$10000 $', reward: '0.25%' },
    { pair: 'cSALE / cSOL', tvl: '5000 $', reward: '0.35%' },
    { pair: 'cMNTL / cSOL', tvl: '5000 $', reward: '0.35%' }
  ];

  constructor(private walletService: WalletService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.walletSubscription = this.walletService.walletConnected$.subscribe(
      connected => {
        this.isWalletConnected = connected;
      }
    );

    // Try to fetch pools from backend, fallback to mock data if fails
    fetch('http://localhost:8888/pools')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched pools:', data);
        if (Array.isArray(data.pools) && data.pools.length > 0) {
          console.log('Inside Fetched pools:', data.pools);
          this.pools = data.pools;
        }
        this.cdr.detectChanges();
      })
      .catch(err => {
        // If fetch fails, keep the default/mock pools
        console.error('Failed to fetch pools, using backup data:', err);
        this.cdr.detectChanges();
      });
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
    this.selectedTokenOne = selectElement.value;

    if (newImage) {
      this.selectedTokenOneImage = newImage;
      this.cdr.detectChanges();
    } else {
      console.error('No data-image attribute found for the selected option.');
    }
  }

  updateTokenTwoImage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const newImage = selectedOption.getAttribute('data-image');
    this.selectedTokenTwo = selectElement.value;

    if (newImage) {
      this.selectedTokenTwoImage = newImage;
      this.cdr.detectChanges();
    } else {
      console.error('No data-image attribute found for the selected option.');
    }
  }

  toggleAddLiquidity() {
    // if (!this.isWalletConnected) {
    //   this.connectWallet();
    // } else {
    //   this.showAddLiquidity = !this.showAddLiquidity;
    // }
     this.showAddLiquidity = !this.showAddLiquidity;
  }

  onTokenOneChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTokenOne = selectElement.value;
    this.selectedTokenTwo = ''; // Reset token two when token one changes
    // Set image for token one
    const tokenImages: { [key: string]: string } = {
      cSOL: 'assets/images/csol.png',
      cSALE: 'assets/images/csale.png',
      cMNTL: 'assets/images/cmntl.png'
    };
    this.selectedTokenOneImage = tokenImages[this.selectedTokenOne] || '';
    this.selectedTokenTwoImage = '';
    this.cdr.detectChanges();
  }

  onTokenTwoChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTokenTwo = selectElement.value;
    // Set image for token two
    const tokenImages: { [key: string]: string } = {
      cUSDC: 'assets/images/cusdc.png',
      cUSDT: 'assets/images/cusdt.png',
      cSOL: 'assets/images/csol.png'
    };
    this.selectedTokenTwoImage = tokenImages[this.selectedTokenTwo] || '';
    this.cdr.detectChanges();
  }

  validateAmount(field: 'amount1' | 'amount2') {
    if (field === 'amount1') {
      this.amount1Invalid = !(this.amount1 !== null && this.amount1 >= 1 && this.amount1 <= 3000);
    } else {
      this.amount2Invalid = !(this.amount2 !== null && this.amount2 >= 1 && this.amount2 <= 3000);
    }
    this.cdr.detectChanges();
  }

  handleDeposit() {
    const token1 = this.selectedTokenOne;
    const token2 = this.selectedTokenTwo;
    const amount1 = this.amount1;
    const amount2 = this.amount2;

    const allowedPairs = [
      ['cSOL', 'cUSDC'],
      ['cSOL', 'cUSDT'],
      ['cSALE', 'cSOL'],
      ['cMNTL', 'cSOL']
    ];
    if (!token1 || !token2 || !allowedPairs.some(([a, b]) => a === token1 && b === token2)) {
      alert('Please select a valid token pair');
      return;
    }
    if (
      amount1 === null || amount2 === null ||
      amount1 < 1 || amount1 > 3000 ||
      amount2 < 1 || amount2 > 3000
    ) {
      alert('Amounts must be between 1 and 3000');
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

  closeResult() {
    this.loading = false;
    this.depositResult = null;
    this.depositError = null;
    this.cdr.detectChanges();
  }

  openInNewTab(url: string) {
    window.open(url, '_blank');
  }
}