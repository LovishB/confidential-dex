import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExecuteSolanaCliService } from './execute-solana-cli.service';
import { Web3SolanaService } from './web3-solana.service';

@Injectable()
export class SwapService {
  constructor(
    private readonly executeSolanaCliService: ExecuteSolanaCliService,
    private readonly web3SolanaService: Web3SolanaService
  ) {}
  
  /**
   * Execute a token swap operation
   * @param tokenInMintAddress The mint address of the input token
   * @param tokenOutMintAddress The mint address of the output token
   * @param tokenAtokenInAmountAmount The amount of tokenIn to swap
   * @param userWalletPubKey The user's account address for tokenOut
   * @returns An object containing swap execution details
   */
  async swapTokens(
    tokenInMintAddress: string,
    tokenOutMintAddress: string,
    tokenInAmount: number,
    userWalletPubKey: string
  ) {
    try {
      // Implement token swap logic here
      console.log('Swapping tokens with params:', {
        tokenInMintAddress,
        tokenOutMintAddress,
        tokenInAmount,
        userWalletPubKey
      });
        
      // Calculate tokens to receive based on AMM formula
      const estimatedTokenOutAmount = await this.getQuote(
        tokenInMintAddress, 
        tokenOutMintAddress, 
        tokenInAmount
      );

      // Execute the swap using the Solana CLI service
      const swapResult = await this.executeSolanaCliService.executeSwap(
        tokenInMintAddress,
        tokenOutMintAddress,
        tokenInAmount,
        estimatedTokenOutAmount,
        userWalletPubKey
      );

      // Update Liquidity pool reserves onchain
      const swapTx = await this.web3SolanaService.swapLiquidity(
        tokenInMintAddress,
        tokenOutMintAddress,
        tokenInAmount
      );

      console.log('Swap transaction:', swapTx);
      
      return {
        success: true,
        tokenInMintAddress,
        tokenOutMintAddress,
        inputAmount: tokenInAmount,
        outputAmount: estimatedTokenOutAmount,
        userWalletPubKey,
        inputSignature: swapResult.inputSignature,
        outputSignature: swapResult.outputSignature
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      throw new InternalServerErrorException(
        'Failed to execute swap operation',
        { cause: error.message }
      );
    }
  }

  /**
   * Get a quote for swapping tokenA to tokenB
   * @param tokenInMintAddress The mint address of the input token
   * @param tokenOutMintAddress The mint address of the output token
   * @param tokenInAmount The amount of tokenA to swap
   * @returns The estimated amount of tokenB to receive
   */
  async getQuote(
    tokenInMintAddress: string,
    tokenOutMintAddress: string,
    tokenInAmount: number
  ): Promise<number> {
    try {
      // Fetch pool size (reserves)
      const pool = await this.web3SolanaService.getPoolSize(tokenInMintAddress, tokenOutMintAddress);
      const reserveA = Number(pool.tokenAAmount);
      const reserveB = Number(pool.tokenBAmount);

      if (reserveA === 0 || reserveB === 0) {
        return 0;
      }

      // Deduct fee from Token A 0.3% fee (997/1000)
      const tokenAWithFee = tokenInAmount * 997;
      const numerator = tokenAWithFee * reserveB;
      const denominator = reserveA * 1000 + tokenAWithFee;
      const amountOut = Math.floor(numerator / denominator);
    
      console.log('Getting quote for swap:', {
        tokenInMintAddress,
        tokenOutMintAddress,
        reserveA,
        reserveB,
        tokenInAmount,
        tokenOutAmount: amountOut
      });
      
       return amountOut; 
    } catch (error) {
      console.error('Error getting quote:', error);
      throw new InternalServerErrorException(
        'Failed to calculate swap quote',
        { cause: error.message }
      );
    }
  }
}