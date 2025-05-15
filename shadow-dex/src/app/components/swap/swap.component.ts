import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent implements OnInit, OnDestroy {
  isWalletConnected = false;
  private walletSubscription: Subscription = new Subscription();
  selectedFromTokenImage = 'assets/images/csol.png';
  selectedToTokenImage = 'assets/images/csol.png';
  loading = false;
  loadingMessage = '';
  loadingMessages = [
    "Securing your confidential swap...hold tight.",
    "Processing your private exchange",
    "Encrypting transactions. This may take a moment.",
    "Your confidential assets are being exchanged securely",
    "Hang on! We’re ensuring your swap is private."
  ];
  private loadingMsgIndex = 0;
  private loadingMsgInterval: any = null;
  swapResult: any = null;
  swapError: string | null = null;

  fromToken: string = ''; // No default selected
  fromAmount: string = '';
  toToken: string = '';
  toAmount: string = '';

  countdown: number = 59;
  private countdownInterval: any;

  readonly allowedPairs: { from: string, to: string, max: number }[] = [
    { from: 'cSOL', to: 'cUSDC', max: 5 },
    { from: 'cSOL', to: 'cUSDT', max: 5 },
    { from: 'cSALE', to: 'cSOL', max: 3000 },
    { from: 'cMNTL', to: 'cSOL', max: 3000 }
  ];

  showLimitPopup = false;

  constructor(private walletService: WalletService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.walletSubscription = this.walletService.walletConnected$.subscribe(
      connected => {
        this.isWalletConnected = connected;
      }
    );
    // Do not set fromAmount or toToken here
    // this.fetchQuote(); // Optionally, only call fetchQuote after user selects a token
  }

  ngOnDestroy() {
    if (this.walletSubscription) {
      this.walletSubscription.unsubscribe();
    }
    this.stopCountdown();
  }

  updateFromTokenImage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const newImage = selectedOption.getAttribute('data-image');

    if (newImage) {
      this.selectedFromTokenImage = newImage;
      this.cdr.detectChanges(); // Manually trigger change detection
    } else {
      console.error('No data-image attribute found for the selected option.');
    }
  }

  updateToTokenImage(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const newImage = selectedOption.getAttribute('data-image');

    if (newImage) {
      this.selectedToTokenImage = newImage;
      this.cdr.detectChanges(); // Manually trigger change detection
    } else {
      console.error('No data-image attribute found for the selected option.');
    }
  }

  async connectWallet() {
    await this.walletService.connectWallet();
  }

  handleSwap() {
    const max = this.getMaxForCurrentPair();
    const min = this.getMinForCurrentToken();
    const amount = +this.fromAmount;

    if (!this.fromAmount || amount > max || amount < min) {
      this.showLimitPopup = true;
      return;
    }

    const fromToken = this.fromToken;
    const fromAmount = this.fromAmount;
    const toToken = this.toToken;

    if (!this.isPairAllowed()) {
      alert('This swap pair is not allowed.');
      return;
    }

    // Set these so the loading popup shows the correct token names
    this.fromToken = fromToken;
    this.toToken = toToken;

    // Token symbol to address mapping
    const tokenAddresses: { [key: string]: string } = {
      cUSDC: 'BgD198WqG42r6FHGFKSA3QPnB7NbSYQB74xGhjHLzUKy',
      cUSDT: '6i5mx6oPf5bJwSuLtZ7p35K4GxJbYzaiFniYTgpBiSmw',
      cSOL: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U',
      cSALE: 'GJChkYoTLcrh2NEeLenZ9JjFzbBwgyjXq1TWdrbUSxZf',
      cMNTL: 'A2ameLz6b3F5MjiQSF4HLEnjHZGZ4jCpkm9B81wSV3to'
    };

    // Prepare request body
    const body = {
      tokenInMintAddress: tokenAddresses[fromToken],   // from-token is tokenIn
      tokenOutMintAddress: tokenAddresses[toToken], // to-token is tokenOut
      tokenInAmount: +fromAmount,
      userWalletPubKey: this.walletService.getPublicKey()
    };

    // Start loading popup
    this.loading = true;
    this.startCountdown();
    this.loadingMsgIndex = 0;
    this.loadingMessage = this.loadingMessages[this.loadingMsgIndex];
    this.loadingMsgInterval = setInterval(() => {
      this.loadingMsgIndex = (this.loadingMsgIndex + 1) % this.loadingMessages.length;
      this.loadingMessage = this.loadingMessages[this.loadingMsgIndex];
      this.cdr.detectChanges();
    }, 3000);

    fetch('http://localhost:8888/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        this.stopLoading(false); // Don't hide loading, show result
        this.swapResult = {
          tokenInAmount: data.inputAmount,
          tokenOutAmount: data.outputAmount,
          tokenInMintAddress: fromToken,
          tokenOutMintAddress: toToken,
          signature1: data.inputSignature,
          signature2: data.outputSignature
        };
        this.cdr.detectChanges();
      })
      .catch(err => {
        this.stopLoading();
        this.swapError = 'Swap failed: ' + err.message;
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
      this.stopCountdown();
    }
    this.cdr.detectChanges();
  }

  closeResult() {
    this.loading = false;
    this.stopCountdown();
    this.swapResult = null;
    this.swapError = null;
    this.cdr.detectChanges();
  }

  fetchQuote() {
    const amount = Number(this.fromAmount);
    if (!this.isPairAllowed() || !this.fromAmount || isNaN(amount) || amount <= 0 || amount > this.getMaxForCurrentPair()) {
      this.toAmount = '0';
      this.cdr.detectChanges();
      return;
    }

    // Show "computing ..." while waiting for backend
    this.toAmount = 'computing ...';
    this.cdr.detectChanges();

    const tokenAddresses: { [key: string]: string } = {
      cUSDC: 'BgD198WqG42r6FHGFKSA3QPnB7NbSYQB74xGhjHLzUKy',
      cUSDT: '6i5mx6oPf5bJwSuLtZ7p35K4GxJbYzaiFniYTgpBiSmw',
      cSOL: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U',
      cSALE: 'GJChkYoTLcrh2NEeLenZ9JjFzbBwgyjXq1TWdrbUSxZf',
      cMNTL: 'A2ameLz6b3F5MjiQSF4HLEnjHZGZ4jCpkm9B81wSV3to'
    };

    const body = {
      tokenAMintAddress: tokenAddresses[this.fromToken],
      tokenBMintAddress: tokenAddresses[this.toToken],
      tokenAAmount: amount
    };

    fetch('http://localhost:8888/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json())
      .then(data => {
        this.toAmount = data.estimatedOutputAmount?.toString() || '0';
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.toAmount = '0';
        this.cdr.detectChanges();
      });
  }

  // Call this on input/select change
  onFromAmountChange(event: any) {
    if (!this.fromToken) return;
    this.fromAmount = event.target.value;
    // Do NOT show the popup here!
    // Just update the quote or reset if over max
    const max = this.getMaxForCurrentPair();
    if (+this.fromAmount > max) {
      // Optionally, clamp the value or just show the subtext warning in the template
      // this.fromAmount = max.toString();
      // this.cdr.detectChanges();
      // return;
    }
    this.fetchQuote();
  }
  onFromTokenChange(event: any) {
    this.fromToken = event.target.value;
    this.updateFromTokenImage(event);

    // Only set defaults if a valid token is selected
    if (this.fromToken === 'cSOL') {
      this.fromAmount = '3';
    } else if (this.fromToken === 'cSALE' || this.fromToken === 'cMNTL') {
      this.fromAmount = '3000';
    } else {
      this.fromAmount = '';
      this.toToken = '';
      this.toAmount = '';
      this.cdr.detectChanges();
      return;
    }

    // Automatically select the first allowed "to" token for the new "from" token
    const allowedToTokens = this.getAllowedToTokens();
    if (!allowedToTokens.includes(this.toToken)) {
      this.toToken = allowedToTokens[0];
      const tokenImages: { [key: string]: string } = {
        cSOL: 'assets/images/csol.png',
        cUSDT: 'assets/images/cusdt.png',
        cUSDC: 'assets/images/cusdc.png',
        cSALE: 'assets/images/csale.png',
        cMNTL: 'assets/images/cmntl.png'
      };
      this.selectedToTokenImage = tokenImages[this.toToken];
    }

    this.fetchQuote();
    this.cdr.detectChanges();
  }
  onToAmountChange(event: any) {
    this.toAmount = event.target.value;
  }
  onToTokenChange(event: any) {
    this.toToken = event.target.value;
    this.updateToTokenImage(event);
    this.fetchQuote();
  }

  openInNewTab(url: string) {
    window.open(url, '_blank');
  }

  getAllowedToTokens(): string[] {
    return this.allowedPairs
      .filter(pair => pair.from === this.fromToken)
      .map(pair => pair.to);
  }

  getMaxForCurrentPair(): number {
    const found = this.allowedPairs.find(pair => pair.from === this.fromToken && pair.to === this.toToken);
    return found ? found.max : 0;
  }

  getMinForCurrentToken(): number {
    if (this.fromToken === 'cSOL') return 1;
    if (this.fromToken === 'cSALE' || this.fromToken === 'cMNTL') return 1000;
    return 1; // default min
  }

  isPairAllowed(): boolean {
    return !!this.allowedPairs.find(pair => pair.from === this.fromToken && pair.to === this.toToken);
  }

  closeLimitPopup() {
    this.showLimitPopup = false;
    this.cdr.detectChanges();
  }

  startCountdown() {
    this.countdown = 59;
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}