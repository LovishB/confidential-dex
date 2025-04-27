import { Component } from '@angular/core';

@Component({
  selector: 'app-swap',
  templateUrl: './swap.component.html',
  styleUrls: ['./swap.component.scss']
})
export class SwapComponent {
  // Handler for swap button click
  handleSwap(): void {
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