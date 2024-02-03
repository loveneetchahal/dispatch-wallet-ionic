import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Transaction} from '../../store/states/transaction';
import {AppService} from '../../app/app.service';

/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-details',
    templateUrl: 'details.html',
})
export class DetailsPage {

    /**
     * Class level declarations
     */
    public transaction: Transaction;

    /**
     *
     * @param {NavController} navCtrl
     * @param {NavParams} navParams
     */
    constructor(public navCtrl: NavController, public navParams: NavParams, private appService: AppService) {
        this.transaction = navParams.data;
        if (this.transaction.type === 1) {
            this.appService.getStatus(this.transaction.hash).subscribe(response => {
                this.transaction.address = response.data.receipt.contractAddress;
            });
        }
    }
}
