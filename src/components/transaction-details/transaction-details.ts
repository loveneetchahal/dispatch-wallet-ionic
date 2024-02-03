import {Component, Input} from '@angular/core';
import {ToastController} from 'ionic-angular';
import {AppService} from '../../app/app.service';
import {Clipboard} from '@ionic-native/clipboard';

/**
 * Generated class for the TransactionDetailsComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'transaction-details',
    templateUrl: 'transaction-details.html'
})
export class TransactionDetailsComponent {

    /**
     *
     */
    @Input()
    public transaction: any;
    @Input()
    public sent = true;

    /**
     *
     */
    constructor(private appService: AppService, public toastController: ToastController, private clipboard: Clipboard) {
    }

    ngOnInit() {
        if (this.transaction.type === 1) {
            this.appService.getStatus(this.transaction.hash).subscribe(response => {
                this.transaction.address = response.data.receipt.contractAddress;
            });
        }
    }

    /**
     *
     * @param {number} time
     * @returns {string}
     */
    public getDate(time: number): string {
        return (new Date(time)).toLocaleDateString() + ' ' + (new Date(time)).toLocaleTimeString();
    }

    /**
     *
     */
    public copyContractAddressToClipboard() {
        this.clipboard.copy(this.transaction.address);
        let toast = this.toastController.create({
            message: 'Copied to clipboard!',
            duration: 3000,
            position: 'top'
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    } 
}
