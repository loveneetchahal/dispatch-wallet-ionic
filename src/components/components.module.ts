import {NgModule} from '@angular/core';
import {TransactionDetailsComponent} from './transaction-details/transaction-details';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [TransactionDetailsComponent],
    imports: [CommonModule],
    exports: [TransactionDetailsComponent]
})
export class ComponentsModule {
}
