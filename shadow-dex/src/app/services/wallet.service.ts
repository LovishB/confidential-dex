import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare global {
  interface Window {
    solana?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletConnectedSubject = new BehaviorSubject<boolean>(false);
  public walletConnected$ = this.walletConnectedSubject.asObservable();
  
  public walletAddress: string | null = null;

  constructor() {
    // Check if wallet was previously connected
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      if (window.solana?.isPhantom) {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        this.walletAddress = resp.publicKey.toString();
        this.walletConnectedSubject.next(true);
      }
    } catch (error) {
      // User has not previously connected
      this.walletConnectedSubject.next(false);
    }
  }

  async connectWallet(): Promise<boolean> {
    if (!window.solana) {
      alert('Phantom wallet not installed. Please install it from https://phantom.app/');
      return false;
    }

    try {
      const resp = await window.solana.connect();
      this.walletAddress = resp.publicKey.toString();
      this.walletConnectedSubject.next(true);
      return true;
    } catch (error) {
      console.error('Failed to connect to wallet', error);
      return false;
    }
  }

  async disconnectWallet() {
    if (window.solana) {
      await window.solana.disconnect();
      this.walletAddress = null;
      this.walletConnectedSubject.next(false);
    }
  }
}