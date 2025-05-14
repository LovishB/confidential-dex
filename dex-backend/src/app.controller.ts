import { Controller, Get, Post, Body } from '@nestjs/common';
import { LiquidityPoolService } from './services/liquidity-pool.service';
import { SwapService } from './services/swap.service';

@Controller()
export class AppController {
  constructor(
    private readonly liquidityPoolService: LiquidityPoolService,
    private readonly swapService: SwapService
  ) {}

  @Get()
  getServerStatus(): string {
    return "SERVER IS UP AND RUNNING";
  }

  @Get('pools')
  getPools() {
    return { pools: this.liquidityPoolService.getPools() };
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
}
