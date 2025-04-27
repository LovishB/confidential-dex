import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { SwapComponent } from './components/swap/swap.component';
import { PoolsComponent } from './components/pools/pools.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'swap', component: SwapComponent },
  { path: 'pools', component: PoolsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }