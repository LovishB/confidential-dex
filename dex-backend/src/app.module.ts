import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LiquidityPoolService } from './services/liquidity-pool.service';
import { SwapService } from './services/swap.service';
import { ExecuteSolanaCliService } from './services/execute-solana-cli.service';
import { Web3SolanaService } from './services/web3-solana.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    LiquidityPoolService,
    SwapService,
    ExecuteSolanaCliService,
    Web3SolanaService
  ]
})
export class AppModule {}
