import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {APP_CLEAR_ALL_STATES, AppService} from './app.service';
import {ActionReducer, ActionReducerMap, MetaReducer, StoreModule} from '@ngrx/store';
import {AppState} from './app.state';
import {ConfigAction} from '../store/reducers/config.reducer';
import {Clipboard} from '@ionic-native/clipboard';
import {CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ScreenOrientation} from '@ionic-native/screen-orientation';
import {ComponentsModule} from '../components/components.module';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {HttpClientModule} from '@angular/common/http';
import {Pro} from '@ionic/pro';
import {NewWalletPage} from '../pages/new-wallet/new-wallet';

Pro.init('C00541E2', {
    appVersion: '0.0.1'
})

export const KEY = 'df2380f2-f131-4c80-9dc0-eababfdf0d71';

/**
 * reducers
 */
const reducers: ActionReducerMap<AppState> = {
    config: ConfigAction.reducer
};

/**
 *
 * @param {ActionReducer<AppState>} reducer
 * @returns {ActionReducer<AppState>}
 */
export function localStorageReducer(reducer: ActionReducer<any>): ActionReducer<any> {
    return function (state: AppState, action: any): AppState {
        if (typeof localStorage !== 'undefined') {
            if (action.type === '@ngrx/store/init') {
                return reducer(Object.assign({}, JSON.parse(localStorage.getItem(KEY))), action);
            } else if (action.type === APP_CLEAR_ALL_STATES) {
                return reducer(Object.create({}), action);
            }
            localStorage.setItem(KEY, JSON.stringify(state));
        }
        return reducer(state, action);
    };
}

const metaReducers: MetaReducer<AppState>[] = [localStorageReducer];

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        LoginPage,
        NewWalletPage
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        ComponentsModule,
        HttpClientModule,
        IonicModule.forRoot(MyApp),
        // NGRX
        StoreModule.forRoot(reducers, {metaReducers}),
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        LoginPage,
        NewWalletPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AppService,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        Clipboard,
        ScreenOrientation,
        InAppBrowser,
    ]
})
export class AppModule {
}
