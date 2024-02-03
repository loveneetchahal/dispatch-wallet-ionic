import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Content, NavController} from 'ionic-angular';
import {APP_REFRESH, AppService} from '../../app/app.service';
import {Observable} from 'rxjs/Observable';
import {Config} from '../../store/states/config';
import {AppState} from '../../app/app.state';
import {Store} from '@ngrx/store';
import {Transaction} from '../../store/states/transaction';
import {InAppBrowser, InAppBrowserOptions} from '@ionic-native/in-app-browser';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html',
})
export class HomePage implements OnInit, OnDestroy {

    public options: InAppBrowserOptions = {
        location: 'yes',
        hidden: 'no', //Or  'yes'
        clearcache: 'yes',
        clearsessioncache: 'yes',
        zoom: 'yes',//Android only ,shows browser zoom controls
        hardwareback: 'yes',
        mediaPlaybackRequiresUserAction: 'no',
        shouldPauseOnSuspend: 'no', //Android only
        closebuttoncaption: 'Close', //iOS only
        disallowoverscroll: 'no', //iOS only
        toolbar: 'yes', //iOS only
        enableViewportScale: 'no', //iOS only
        allowInlineMediaPlayback: 'no',//iOS only
        presentationstyle: 'pagesheet',//iOS only
        fullscreen: 'yes',//Windows only
    };

    /**
     * Class level-declarations.
     */
    public configState: Observable<Config>;
    public config: Config;
    public configSubscription: any;
    public appEventSubscription: any;
    public transaction: Transaction;
    public displaySection: string;
    public transactionType = 'sent';
    public currentTransactionHash: string;
    public url: string;
    @ViewChild(Content) content: Content;

    /**
     *
     * @param {NavController} navCtrl
     * @param {Store<AppState>} store
     * @param {AppService} appService
     */
    constructor(public navCtrl: NavController, private store: Store<AppState>, private appService: AppService, public inAppBrowser: InAppBrowser) {
        this.configState = this.store.select('config');
        this.configSubscription = this.configState.subscribe((config: Config) => {
            this.config = config;
        });
        this.appEventSubscription = this.appService.appEvents.subscribe((event: any) => {
            switch (event.type) {
                case APP_REFRESH:
                    this.appService.refreshDefaultAccount();
                    return;
            }
        });
        this.displaySection = 'transactionsSection';
    }

    /**
     *
     */
    ngOnInit() {
        this.content.resize();
    }

    /**
     *
     */
    ngOnDestroy() {
        this.configSubscription.unsubscribe();
        this.appEventSubscription.unsubscribe();
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
     * @param {Transaction} transaction
     */
    public sendTokens(transaction: Transaction) {
        this.navCtrl.push('SendTokensPage');
    }

    /**
     *
     * @param {Transaction} transaction
     */
    public onDetailsClicked(transaction: Transaction): void {
        if (transaction.hash === this.currentTransactionHash) {
            this.currentTransactionHash = null;
        } else {
            this.currentTransactionHash = transaction.hash;
        }
    }

    /**
     *
     */
    public openLink(url: string) {
        this.inAppBrowser.create(url, '_blank');
    }
}
