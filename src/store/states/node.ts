import {Endpoint} from './endpoint';

/**
 * Node
 */
export interface Node {

    /**
     * Interface level-declarations.
     */
    address: string;
    httpEndpoint: Endpoint;
}
