import { MetaMaskInpageProvider } from '@metamask/providers';
import { Web3Hooks } from '@hooks/web3/setupHooks';
import { Web3Dependencies } from '@interfaces/hooks';

declare global {
    interface Window {
        ethereum: MetaMaskInpageProvider;
    }
}

type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

export interface IWeb3State extends Nullable<Web3Dependencies> {
    isLoading: boolean;
    hooks: Web3Hooks;
}
