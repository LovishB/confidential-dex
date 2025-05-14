import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExecuteSolanaCliService } from './execute-solana-cli.service';

@Injectable()
export class LiquidityPoolService {
  constructor(private readonly executeSolanaCliService: ExecuteSolanaCliService) {}

  /**
   * Deposit liquidity to the pool
   * @param tokenAMintAddress The mint address of token A
   * @param tokenBMintAddress The mint address of token B
   * @param tokenAAmount The amount of token A to deposit
   * @param tokenBAmount The amount of token B to deposit
   * @returns An object containing deposit details and transaction signatures
   */
  async depositLiquidity(
    tokenAMintAddress: string,
    tokenBMintAddress: string,
    tokenAAmount: number, 
    tokenBAmount: number
  ) {
    try {
      console.log('Depositing liquidity with params:', {
        tokenAMintAddress,
        tokenBMintAddress,
        tokenAAmount,
        tokenBAmount
      });

      // Execute the deposit using the Solana CLI service
      const depositResult = await this.executeSolanaCliService.executeDeposit(
        tokenAMintAddress,
        tokenBMintAddress,
        tokenAAmount,
        tokenBAmount
      );

      return {
        success: true,
        message: 'Liquidity deposited successfully',
        data: {
          tokenAMintAddress,
          tokenBMintAddress,
          tokenAAmount,
          tokenBAmount,
          signatureTokenATransfer: depositResult.signatureTokenATransfer,
          signatureTokenBTransfer: depositResult.signatureTokenBTransfer
        }
      };
    } catch (error) {
      console.error('Error depositing liquidity:', error);
      throw new InternalServerErrorException(
        'Failed to deposit liquidity',
        { cause: error.message }
      );
    }
  }

  /**
   * Get all available pools
   */
  getPools() {
    return [
      { pair: 'ETH/USDC', tvl: '$10.5M', reward: '0.3%' },
      { pair: 'WBTC/USDT', tvl: '$10.2M', reward: '0.25%' },
      { pair: 'SOL/USDC', tvl: '$10.7M', reward: '0.35%' }
      // Add more pool data as needed
    ];
  }
}