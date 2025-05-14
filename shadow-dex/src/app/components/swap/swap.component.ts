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

  fromAmount: string = '0';
  fromToken: string = 'cSOL'; // <-- set default to match your select default
  toAmount: string = '0';
  toToken: string = 'cSOL';   // <-- set default to match your select default

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
    const fromToken = (document.getElementById('from-token') as HTMLSelectElement).value;
    const fromAmount = (document.getElementById('from-amount') as HTMLInputElement).value;
    const toToken = (document.getElementById('to-token') as HTMLSelectElement).value;

    if (!fromAmount || +fromAmount <= 0) {
      alert('Please enter a valid amount');
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
    }
    this.cdr.detectChanges();
  }

  closeResult() {
    this.loading = false;
    this.swapResult = null;
    this.swapError = null;
    this.cdr.detectChanges();
  }

  fetchQuote() {
    // Only fetch if all required fields are set and fromAmount is a valid positive number
    const amount = Number(this.fromAmount);
    if (!this.fromAmount || isNaN(amount) || amount <= 0 || !this.fromToken || !this.toToken) {
      this.toAmount = '0';
      this.cdr.detectChanges();
      return;
    }

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
    this.fromAmount = event.target.value;
    this.fetchQuote();
  }
  onFromTokenChange(event: any) {
    this.fromToken = event.target.value;
    this.updateFromTokenImage(event);
    this.fetchQuote();
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
}