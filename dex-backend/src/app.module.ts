import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LiquidityPoolService } from './services/liquidity-pool.service';
import { SwapService } from './services/swap.service';
import { ExecuteSolanaCliService } from './services/execute-solana-cli.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    LiquidityPoolService,
    SwapService,
    ExecuteSolanaCliService
  ]
})
export class AppModule {}
