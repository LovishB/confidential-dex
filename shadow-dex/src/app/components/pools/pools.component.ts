import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pools',
  templateUrl: './pools.component.html',
  styleUrls: ['./pools.component.scss']
})
export class PoolsComponent implements OnInit {
  // Sample pool data
  pools = [
    { pair: 'ETH/USDT', tvl: '$1,234,567', reward: '0.3%' },
    { pair: 'ETH/USDC', tvl: '$987,654', reward: '0.3%' },
    { pair: 'WBTC/ETH', tvl: '$456,789', reward: '0.3%' }
  ];
  
  showAddLiquidity = false;

  ngOnInit() {
    // Initialize the component
  }

  toggleAddLiquidity() {
    this.showAddLiquidity = !this.showAddLiquidity;
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