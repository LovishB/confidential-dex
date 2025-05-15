import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ExecuteSolanaCliService } from './execute-solana-cli.service';
import { Web3SolanaService } from './web3-solana.service';

@Injectable()
export class LiquidityPoolService {
  constructor(
    private readonly executeSolanaCliService: ExecuteSolanaCliService,
    private readonly web3SolanaService: Web3SolanaService
) {}

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

      // Update Liquidity pool reserves onchain
      const swapTx = await this.web3SolanaService.depositLiquidity(
        tokenAMintAddress,
        tokenBMintAddress,
        tokenAAmount,
        tokenBAmount
      );

      console.log('Swap transaction:', swapTx);
      

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
   * Get all available pools with on-chain pool sizes
   */
  async getPools() {
    const pairs = [
      {
        pair: 'cSOL / cUSDC',
        tokenA: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U',
        tokenB: 'BgD198WqG42r6FHGFKSA3QPnB7NbSYQB74xGhjHLzUKy'
      },
      {
        pair: 'cSOL / cUSDT',
        tokenA: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U',
        tokenB: '6i5mx6oPf5bJwSuLtZ7p35K4GxJbYzaiFniYTgpBiSmw'
      },
      {
        pair: 'cSALE / cSOL',
        tokenA: 'GJChkYoTLcrh2NEeLenZ9JjFzbBwgyjXq1TWdrbUSxZf',
        tokenB: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U'
      },
      {
        pair: 'cMNTL / cSOL',
        tokenA: 'A2ameLz6b3F5MjiQSF4HLEnjHZGZ4jCpkm9B81wSV3to',
        tokenB: 'DEsvgQDbd4B8rx5YEZ5MJQx4uaum3D81GcoYrvbTCF5U'
      }
    ];

    const results: Array<
      | {
          pair: string;
          tvl: string;
          reward: string;
        }
    > = [];

    for (const p of pairs) {
      try {
        const poolSize = await this.web3SolanaService.getPoolSize(p.tokenA, p.tokenB);
        let TVL: string;
        if (p.pair === 'cSOL/cUSDC' || p.pair === 'cSOL/cUSDT') {
          TVL = `${Number(poolSize.tokenBAmount) * 2} $`;
        } else {
          TVL = `${Number(poolSize.tokenBAmount) * 2} SOL`;
        }
        results.push({
          pair: p.pair,
          tvl: TVL,
          reward: '0.3%'
        });
      } catch (error) {
        results.push({
          pair: p.pair,
          tvl: '10000$',
          reward: '0.3%'
        });
      }
    }
    console.log('Liquidity pools:', results);
    return results;
  }
}