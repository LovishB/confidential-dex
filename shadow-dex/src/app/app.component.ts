import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <div class="header">
        <div class="logo">ShadowDEX</div>
        <nav class="nav">
          <a [routerLink]="['/']" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a [routerLink]="['/swap']" routerLinkActive="active">Swap</a>
          <a [routerLink]="['/pools']" routerLinkActive="active">Pools</a>
        </nav>
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
    .content {
      margin-top: 20px;
      height: 100%;
      overflow-y: auto;
    }
  `]
})
export class AppComponent {
  title = 'shadow-dex';
}