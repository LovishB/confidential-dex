import { Controller, Get, Post, Body } from '@nestjs/common';
import { LiquidityPoolService } from './services/liquidity-pool.service';
import { SwapService } from './services/swap.service';
import { Web3SolanaService } from './services/web3-solana.service';

@Controller()
export class AppController {
  constructor(
    private readonly liquidityPoolService: LiquidityPoolService,
    private readonly swapService: SwapService,
    private readonly web3SolanaService: Web3SolanaService
  ) {}

  @Get()
  getServerStatus(): string {
    return "SERVER IS UP AND RUNNING";
  }

  @Get('pools')
  async getPools() {
    const pools = await this.liquidityPoolService.getPools();
    if (!pools || pools.length === 0) {
      return {
        message: 'No pools available',
        pools: []
      };
    } 
    return { pools };
  }

  @Post('quote')
  async getQuote(
    @Body() quoteData: {
      tokenAMintAddress: string;
      tokenBMintAddress: string;
      tokenAAmount: number;
    }
  ) {
    const { tokenAMintAddress, tokenBMintAddress, tokenAAmount } = quoteData;
    
    const estimatedAmount = await this.swapService.getQuote(
      tokenAMintAddress,
      tokenBMintAddress,
      tokenAAmount
    );
    
    return {
      tokenAMintAddress,
      tokenBMintAddress,
      inputAmount: tokenAAmount,
      estimatedOutputAmount: estimatedAmount
    };
  }

  @Post('deposit')
  async depositLiquidity(
    @Body() depositData: {
      tokenAMintAddress: string;
      tokenBMintAddress: string;
      tokenAAmount: number;
      tokenBAmount: number;
    }
  ) {
    const { tokenAMintAddress, tokenBMintAddress, tokenAAmount, tokenBAmount } = depositData;
    
    return this.liquidityPoolService.depositLiquidity(
      tokenAMintAddress,
      tokenBMintAddress,
      tokenAAmount,
      tokenBAmount
    );
  }

  @Post('swap')
  async swapTokens(
    @Body() swapData: {
      tokenInMintAddress: string;
      tokenOutMintAddress: string;
      tokenInAmount: number;
      userWalletPubKey: string;
    }
  ) {
    const { tokenInMintAddress, tokenOutMintAddress, tokenInAmount, userWalletPubKey } = swapData;
    
    return this.swapService.swapTokens(
      tokenInMintAddress,
      tokenOutMintAddress,
      tokenInAmount,
      userWalletPubKey
    );
  }

  @Post('initialize-pool')
  async initializePool(
    @Body() body: {
      tokenAMintAddress: string;
      tokenBMintAddress: string;
    }
  ) {
    const { tokenAMintAddress, tokenBMintAddress } = body;
    return this.web3SolanaService.initializePool(tokenAMintAddress, tokenBMintAddress);
  }

  @Post('get-pool-size')
  async getPoolSize(
    @Body() body: {
      tokenAMintAddress: string;
      tokenBMintAddress: string;
    }
  ) {
    const { tokenAMintAddress, tokenBMintAddress } = body;
    return this.web3SolanaService.getPoolSize(tokenAMintAddress, tokenBMintAddress);
  }

  @Post('depositLiquidityToContract')
  async depositLiquidityToContract(
    @Body() body: {
      tokenAMintAddress: string;
      tokenBMintAddress: string;
      tokenAAmount: number,
      tokenBAmount: number
    }
  ) {
    const { tokenAMintAddress, tokenBMintAddress, tokenAAmount, tokenBAmount } = body;
    return this.web3SolanaService.depositLiquidity(tokenAMintAddress, tokenBMintAddress, tokenAAmount, tokenBAmount);
  }

  @Post('swapLiquidityToContract')
  async swapLiquidityToContract(
    @Body() body: {
      tokenAMintAddress: string;
      tokenBMintAddress: string;
      tokenAAmount: number
    }
  ) {
    const { tokenAMintAddress, tokenBMintAddress, tokenAAmount } = body;
    return this.web3SolanaService.swapLiquidity(tokenAMintAddress, tokenBMintAddress, tokenAAmount);
  }
}
