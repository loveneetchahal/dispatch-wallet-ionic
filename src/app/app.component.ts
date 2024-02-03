import {Component, ViewChild} from '@angular/core';
import {MenuController, Nav, Platform, ToastController} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ScreenOrientation} from '@ionic-native/screen-orientation';
import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {Observable} from 'rxjs/Observable';
import {Config} from '../store/states/config';
import {AppState} from './app.state';
import {Store} from '@ngrx/store';
import {ConfigAction} from '../store/reducers/config.reducer';
import {APP_REFRESH, AppService} from './app.service';
import {Clipboard} from '@ionic-native/clipboard';
import {NewWalletPage} from '../pages/new-wallet/new-wallet';

@Component({
    templateUrl: 'app.html',
    providers: [
        ScreenOrientation
    ]

})
export class MyApp {

    /**
     * Class Level Declarations
     */
    @ViewChild(Nav) nav: Nav;
    public configState: Observable<Config>;
    public config: Config;
    public configSubscription: any;
    @ViewChild('walletInfo')
    public walletInfo: any;
    public disclaimer = true;
    rootPage: any = LoginPage;
    pages: Array<{ title: string, component: any }>;
    public selectedAddress: string;

    /**
     *
     * @param appService
     * @param platform
     * @param statusBar
     * @param splashScreen
     * @param screenOrientation
     * @param store
     * @param toastController
     * @param clipboard
     * @param menuController
     */
    constructor(private appService: AppService, public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public screenOrientation: ScreenOrientation, private store: Store<AppState>, public toastController: ToastController, private clipboard: Clipboard, public menuController: MenuController) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            {title: 'Home', component: HomePage}
        ];

        this.configState = this.store.select('config');
        this.configSubscription = this.configState.subscribe((config: Config) => {
            this.config = config;
            if (this.config.defaultAccount) {
                this.selectedAddress = this.config.defaultAccount.address;
            }
        });

        // lock screen orientation to portrait, comment out for browser testing
        // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);

        this.statusBar.styleLightContent();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            // Set orientation to portrait
            // this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }
  
    /**
     *
     * @param {string} name
     */
    public onNameChange(name: string): void {
        this.config.defaultAccount.name = name;
        this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
    }

    /**
     *
     * @param {string} address
     */
    public onAccountChange(address: string): void {
        for (let account of this.config.accounts) {
            if (account.address === address) {
                this.config.defaultAccount = account;
                this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
                this.appService.appEvents.emit({type: APP_REFRESH});
                return;
            }
        }
    }

    /**
     *
     */
    public copyAddressToClipboard() {
        this.clipboard.copy(this.config.defaultAccount.address);
        let toast = this.toastController.create({
            message: 'Address copied to clipboard!',
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    /**
     *
     */
    public copyPrivateKeyToClipboard() {
        this.clipboard.copy(this.config.defaultAccount.privateKey);
        let toast = this.toastController.create({
            message: 'Private Key copied to clipboard!',
            duration: 3000,
            position: 'top'
        });
        toast.present();
    }

    /**
     *
     */
    public newWallet(): void {
        this.nav.push(NewWalletPage);
        this.menuController.close();
    }
}
