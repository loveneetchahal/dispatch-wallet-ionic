import {EventEmitter, Injectable, OnDestroy} from '@angular/core';
import 'rxjs/add/operator/map'
import {Account} from '../store/states/account';
import {ConfigAction} from '../store/reducers/config.reducer';
import * as keccak from 'keccak';
import * as secp256k1 from 'secp256k1';
import {Store} from '@ngrx/store';
import {AppState} from './app.state';
import {Observable} from 'rxjs/Observable';
import {Config} from '../store/states/config';
import {HttpClient} from '@angular/common/http';
import {Transaction} from '../store/states/transaction';
import {TransactionType} from '../store/states/transaction-type';

declare const Buffer;

/**
 * Events
 */
export const APP_CLEAR_ALL_STATES = 'APP_CLEAR_ALL_STATES';
export const APP_REFRESH = 'APP_REFRESH';

/**
 *
 */
@Injectable()
export class AppService implements OnDestroy {

    /**
     * Class level-declarations.
     */
    public appEvents = new EventEmitter<any>();
    public configState: Observable<Config>;
    public config: Config;
    public configSubscription: any;

    /**
     *
     * @param {HttpClient} httpClient
     * @param {Store<AppState>} store
     */
    constructor(private httpClient: HttpClient, private store: Store<AppState>) {
        this.configState = this.store.select('config');
        this.configSubscription = this.configState.subscribe((config: Config) => {
            this.config = config;
        });
        this.getDelegates();
    }

    /**
     *
     */
    ngOnDestroy() {
        this.configSubscription.unsubscribe();
    }

    /**
     *
     * @returns {Account}
     */
    public newAccount(): void {
        const privateKey = new Buffer(32);
        do {
            crypto.getRandomValues(privateKey);
        } while (!secp256k1.privateKeyVerify(privateKey));
        const publicKey = secp256k1.publicKeyCreate(privateKey, false);

        const account: Account = {
            address: Buffer.from(this.toAddress(publicKey)).toString('hex'),
            privateKey: Buffer.from(privateKey).toString('hex'),
            balance: 0,
            name: 'New Wallet'
        };
        this.config.accounts.push(account);
        this.config.defaultAccount = account;
        this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
    }

    /**
     *
     * @param {string} privateKey
     */
    public newAccountWithPrivateKey(privateKey: string): void {
        const publicKey = secp256k1.publicKeyCreate(Buffer.from(privateKey, 'hex'), false);
        const account: Account = {
            address: Buffer.from(this.toAddress(publicKey)).toString('hex'),
            privateKey: privateKey,
            balance: 0,
            name: 'New Wallet'
        };
        this.config.accounts.push(account);
        this.config.defaultAccount = account;
        this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
        this.refreshDefaultAccount();
    }

    /**
     *
     * @param publicKey
     * @returns {any}
     */
    public toAddress(publicKey: any): any {

        // Hash publicKey.
        const hashablePublicKey = new Buffer(publicKey.length - 1);
        for (let i = 0; i < hashablePublicKey.length; i++) {
            hashablePublicKey[i] = publicKey[i + 1];
        }
        const hash = keccak('keccak256').update(hashablePublicKey).digest();

        // Create address.
        const address = new Buffer(20);
        for (let i = 0; i < address.length; i++) {
            address[i] = hash[i + 12];
        }
        return address;
    }

    /**
     *
     * @param {string} privateKey
     * @param {Transaction} transaction
     */
    public hashAndSign(privateKey: string, transaction: Transaction): void {

        // Set time.
        transaction.time = new Date().getTime();

        // Create hash.
        let hash: any;
        const from = Buffer.from(transaction.from, 'hex');
        const to = Buffer.from(transaction.to, 'hex');
        const value = this.numberToBuffer(transaction.value);
        const time = this.numberToBuffer(transaction.time);
        const abi = this.stringToBuffer(transaction.abi || '');

        // Type?
        switch (transaction.type) {
            case TransactionType.TransferTokens:
                hash = keccak('keccak256').update(Buffer.concat([Buffer.from('00', 'hex'), from, to, value, time])).digest();
                break;
            case TransactionType.DeploySmartContract:
                const code = Buffer.from(transaction.code, 'hex');
                hash = keccak('keccak256').update(Buffer.concat([Buffer.from('01', 'hex'), from, to, value, code, abi, time])).digest();
                break;
            case TransactionType.ExecuteSmartContract:
                const method = this.stringToBuffer(transaction.method);
                hash = keccak('keccak256').update(Buffer.concat([Buffer.from('02', 'hex'), from, to, value, abi, method, time])).digest();
                break;
        }
        transaction.hash = hash.toString('hex');

        // Create signature.
        const signature = secp256k1.sign(hash, Buffer.from(privateKey, 'hex'));
        const signatureBytes = new Uint8Array(65);
        for (let i = 0; i < 64; i++) {
            signatureBytes[i] = signature.signature[i];
        }
        signatureBytes[64] = signature.recovery;
        transaction.signature = new Buffer(signatureBytes).toString('hex');
    }

    /**
     *
     * @param {string} value
     * @returns {any}
     */
    private stringToBuffer(value: string): any {
        const bytes = [];
        for (let i = 0; i < value.length; i++) {
            bytes.push(value.charCodeAt(i));
        }
        return new Buffer(bytes);
    }

    /**
     *
     * @param {number} value
     * @returns {any}
     */
    private numberToBuffer(value: number): any {
        const bytes = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < bytes.length; i++) {
            const byte = value & 0xff;
            bytes [i] = byte;
            value = (value - byte) / 256;
        }
        return new Buffer(bytes);
    }

    /**
     *
     * @returns {any}
     */
    public getStatus(hash: string): any {
        const url = 'http://' + this.config.delegates[0].httpEndpoint.host + ':' + this.config.delegates[0].httpEndpoint.port + '/v1/transactions/' + hash;
        return this.httpClient.get(url, {headers: {'Content-Type': 'application/json'}});
    }

    /**
     *
     */
    public refreshDefaultAccount(): void {
        if (!this.config.defaultAccount) {
            return;
        }

        // From transactions.
        this.httpClient.get('http://' + this.config.delegates[0].httpEndpoint.host + ':' + this.config.delegates[0].httpEndpoint.port + '/v1/transactions?from=' + this.config.defaultAccount.address, {headers: {'Content-Type': 'application/json'}}).subscribe((response: any) => {
            if (response.status === 'Ok') {
                this.config.fromTransactions = response.data;
                this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
            }
        });

        // To transactions.
        this.httpClient.get('http://' + this.config.delegates[0].httpEndpoint.host + ':' + this.config.delegates[0].httpEndpoint.port + '/v1/transactions?to=' + this.config.defaultAccount.address, {headers: {'Content-Type': 'application/json'}}).subscribe((response: any) => {
            if (response.status === 'Ok') {
                this.config.toTransactions = response.data;
                this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
            }
        });

        // Account.
        this.httpClient.get('http://' + this.config.delegates[0].httpEndpoint.host + ':' + this.config.delegates[0].httpEndpoint.port + '/v1/accounts/' + this.config.defaultAccount.address, {headers: {'Content-Type': 'application/json'}}).subscribe((response: any) => {
            if (response.status === 'Ok') {
                this.config.defaultAccount.balance = response.data.balance;
                this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
            }
        });
    }

    /**
     *
     * @returns {any}
     */
    public getDelegates(): any {
        return this.httpClient.get('http://' + this.config.seedNodeIp + '/v1/delegates', {headers: {'Content-Type': 'application/json'}}).subscribe((response: any) => {
            this.config.delegates = response.data;
            this.store.dispatch(new ConfigAction(ConfigAction.CONFIG_UPDATE, this.config));
            this.refreshDefaultAccount();
        });
    }
}
