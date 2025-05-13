import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SwapComponent } from './components/swap/swap.component';
import { PoolsComponent } from './components/pools/pools.component';
import { AppRoutingModule } from './app-routing.module'; // Add this import
import { WalletService } from './services/wallet.service';
import { TokenService } from './services/token.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SwapComponent,
    PoolsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule // Add this line
  ],
  providers: [
    WalletService,
    TokenService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }