import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <div class="header">
        <div class="logo">ConfiX</div>
        <nav class="nav">
          <a [routerLink]="['/']" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a [routerLink]="['/swap']" routerLinkActive="active">Swap</a>
          <a [routerLink]="['/pools']" routerLinkActive="active">Pools</a>
        </nav>
        <div class="wallet-info">
          <div class="wallet-row">
            <span class="wallet-user-icon">
              <!-- User SVG Icon -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="5" fill="#FFF"/>
                <ellipse cx="12" cy="18" rx="7" ry="4" fill="#FFF"/>
              </svg>
            </span>
            <div>
              <div class="wallet-label">Wallet Connected: Test User</div>
              <div class="wallet-address">{{ shortAddress }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .container {
      color: white;
      background-color: #000;
      min-height: 100vh;
      padding: 0 32px; /* Add horizontal padding */
    }
    .header {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 12px 0;
      gap: 40px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #fff;
      margin-left: 20px;
    }
    .nav {
      display: flex;
      gap: 20px;
    }
    .nav a {
      background: none;
      border: none;
      color: #b514ed;
      cursor: pointer;
      font-size: 20px;
      padding: 12px 16px;
      border-radius: 8px;
      transition: all 0.3s;
      font-weight: normal;
      text-decoration: none;
    }
    .nav a.active {
      background-color: #333;
      color: #fff;
    }
    .nav a:hover {
      background-color: #333;
      color: #fff;
    }
    .wallet-info {
      margin-left: auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: #191919;
      padding: 8px 16px;
      border-radius: 8px;
      min-width: 220px;
      border: 2px solid #b514ed; /* Added colored border */
    }
    .wallet-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .wallet-user-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #b514ed; /* Added colored border */
      border-radius: 50%;
      padding: 2px;
      background: #191919;
    }
    .wallet-label {
      font-size: 16px;
      color: #b514ed;
      font-weight: bold;
    }
    .wallet-address {
      font-size: 14px;
      color: #fff;
      font-family: monospace;
      margin-top: 4px;
    }
    .content {
      margin-top: 20px;
      height: 100%;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'confix';
  walletAddress = '26DbLxVUgQPmmwwFNpoWbeTuCT7jn8f19cFZeRtzNwyW';

  get shortAddress(): string {
    // Show first 12 chars, then ...
    return this.walletAddress.slice(0, 22) + '...';
  }
}