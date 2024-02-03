import {Component} from '@angular/core';
import {NavController, NavParams, ToastController} from 'ionic-angular';
import {KeyHelper} from '../../helpers/key-helper';
import {HomePage} from '../home/home';
import {APP_REFRESH, AppService} from '../../app/app.service';

/**
 * Generated class for the NewWalletPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-new-wallet',
    templateUrl: 'new-wallet.html',
})
export class NewWalletPage {

    /**
     * Class Level Declarations
     */
    public privateKey: string;
    public keyHelper = KeyHelper;
    public error: string;

    /**
     *
     * @param appService
     * @param navCtrl
     * @param navParams
     * @param formBuilder
     * @param toastController
     */
    constructor(private appService: AppService, public navCtrl: NavController, public navParams: NavParams, private toastController: ToastController) {
    }

    /**
     *
     * @param {string} privateKey
     */
    public onPrivateKeyChange(value: string): void {
        this.privateKey = value;
        if (this.privateKey.startsWith('0x')) {
            this.privateKey = this.privateKey.replace('0x', '');
        }
        if (this.privateKey.startsWith('0X')) {
            this.privateKey = this.privateKey.replace('0X', '');
        }

        // Valid privateKey (most likely from paste)?
        if (!/^[0-9a-fA-F]+$/.test(this.privateKey) && this.privateKey !== '' && this.privateKey !== null) {
            this.privateKey = null;
            this.error = 'Invalid private key';
            return;
        }

        if (this.privateKey.length === 64) {
            this.appService.newAccountWithPrivateKey(this.privateKey);
            this.navCtrl.setRoot(HomePage);
            let toast = this.toastController.create({
                message: 'New Wallet Added!',
                duration: 3000,
                position: 'top'
            });
            toast.present();
            return;
        }
        this.error = null;
    }

    /**
     *
     */
    public newAccount(): void {
        this.appService.newAccount();
        this.appService.appEvents.emit({type: APP_REFRESH});
        this.navCtrl.setRoot(HomePage);
        let toast = this.toastController.create({
            message: 'New Wallet Generated!',
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }
}
