import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SendTokensPage } from './send-tokens';

@NgModule({
  declarations: [
    SendTokensPage,
  ],
  imports: [
    IonicPageModule.forChild(SendTokensPage),
  ],
})
export class SendTokensPageModule {}
