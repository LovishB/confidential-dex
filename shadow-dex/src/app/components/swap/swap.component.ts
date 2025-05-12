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

    // Simulate swap calculation (in real app, this would call smart contract)
    const mockRate = 1800; // Example rate
    const toAmount = +fromAmount * mockRate;
    (document.getElementById('to-amount') as HTMLInputElement).value = toAmount.toFixed(2);

    alert(`Swapping ${fromAmount} ${fromToken} for ${toAmount.toFixed(2)} ${toToken}`);
  }
}