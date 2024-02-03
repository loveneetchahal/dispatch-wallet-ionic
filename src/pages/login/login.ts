import {Component, OnDestroy, OnInit} from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {HomePage} from '../home/home';
import {AppService} from '../../app/app.service';
import {Config} from '../../store/states/config';
import {Observable} from 'rxjs/Observable';
import {AppState} from '../../app/app.state';
import {Store} from '@ngrx/store';
import {KeyHelper} from '../../helpers/key-helper';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage implements OnInit, OnDestroy {

    /**
     * Class level-declarations
     */
    public configState: Observable<Config>;
    public config: Config;
    public configSubscription: any;
    public privateKey: string;
    public keyHelper = KeyHelper;
    public error: string;

    /**
     *
     * @param {NavController} navCtrl
     * @param {NavParams} navParams
     * @param {AppService} appService
     * @param {Store<AppState>} store
     * @param {ToastController} toastController
     */
    constructor(public navCtrl: NavController, public navParams: NavParams, private appService: AppService, private store: Store<AppState>, private toastController: ToastController) {
        this.configState = this.store.select('config');
        this.configSubscription = this.configState.subscribe((config: Config) => {
            this.config = config;
        });
    }

    /**
     *
     */
    ngOnInit() {
        if (this.config.defaultAccount) {
            this.navCtrl.setRoot(HomePage);
        }
    }

    /**
     *
     */
    ngOnDestroy() {
        this.configSubscription.unsubscribe();
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
                message: 'Welcome to Dispatch Labs',
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
    public next(): void {
        this.appService.newAccount();
        this.navCtrl.setRoot(HomePage);
    }
}
