import { Component, OnInit, OnDestroy } from '@angular/core';
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
  
  // Mock data for pools (replace with actual data source)
  pools = [
    { pair: 'ETH/USDC', tvl: '$12.5M', reward: '0.3%' },
    { pair: 'WBTC/USDT', tvl: '$8.2M', reward: '0.25%' },
    { pair: 'SOL/USDC', tvl: '$5.7M', reward: '0.35%' }
    // Add more pool data as needed
  ];

  constructor(private walletService: WalletService) {}

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

    alert(`Depositing ${amount1} ${token1} and ${amount2} ${token2} to pool`);
  }
}