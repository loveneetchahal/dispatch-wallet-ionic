import {Transaction} from './transaction';
import {Account} from './account';
import {Node} from './node';

/**
 * Config
 */
export interface Config {

    /**
     * Interface level-declarations.
     */
    seedNodeIp: string;
    delegates: Node[];
    defaultAccount: Account;
    accounts: Account[];
    fromTransactions: Transaction[];
    toTransactions: Transaction[];
}
