import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor(private walletService: WalletService) {}

  /**
   * Retrieves Token-2022 tokens in the user's wallet
   */
  async getToken2022Tokens(): Promise<any[]> {
    try {
      const connection = this.walletService.getConnection();
      const publicKey = this.walletService.getPublicKey();
      
      if (!connection || !publicKey) {
        console.log('Wallet not connected');
        return [];
      }
      
      console.log('Fetching Token-2022 accounts for', publicKey.toString());
      
      // Get token accounts owned by the user
      const response = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_2022_PROGRAM_ID }
      );

      console.log('Found', response.value.length, 'Token-2022 accounts');
      
      // Log the raw response for debugging
      console.log('Token accounts response:', response);
      
      // Simple mapping of token data
      const tokens = response.value.map(item => {
        const accountInfo = item.account.data.parsed.info;
        const token = {
          mintAddress: accountInfo.mint,
          tokenAccount: item.pubkey.toString(),
          balance: accountInfo.tokenAmount.uiAmount,
          decimals: accountInfo.tokenAmount.decimals,
          symbol: 'TOKEN-2022'
        };
        
        console.log('Processed token:', token);
        return token;
      });
      
      return tokens;
    } catch (error) {
      console.error('Error fetching Token-2022 tokens:', error);
      return [];
    }
  }

  /**
   * Activates the confidential transfer extension for a Token-2022 token
   * @param mintAddress The address of the token mint
   */
  async activateConfidentialExtension(mintAddress: string): Promise<void> {
    try {
      console.log('Activating confidential extension for mint:', mintAddress);
      
      const connection = this.walletService.getConnection();
      const publicKey = this.walletService.getPublicKey();
      
      if (!connection || !publicKey) {
        console.log('Wallet not connected');
        return;
      }
      
      // Log mint info for debugging
      const mintPubkey = new PublicKey(mintAddress);
      const mintInfo = await connection.getAccountInfo(mintPubkey);
      
      console.log('Mint info:', mintInfo);
      console.log('This is a simplified version - actual confidential extension activation would happen here');
      
      // In a real implementation, you would:
      // 1. Get the token account
      // 2. Create and send a transaction to initialize the confidential transfer extension
      
    } catch (error) {
      console.error('Error in confidential extension activation:', error);
    }
  }
}