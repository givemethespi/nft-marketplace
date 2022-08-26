import { Contract, providers } from 'ethers';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { SWRResponse } from 'swr';
import { NftMarketContract } from '@interfaces/nftMarketContract';

export interface Web3Dependencies {
    provider: providers.Web3Provider;
    contract: NftMarketContract;
    ethereum: MetaMaskInpageProvider;
    isLoading: boolean;
}

type CryptoSWRResponse<D = any, R = any> = SWRResponse<D> & R;

export interface CryptoHandlerHook<P = any, R = any, D = any> {
    (params?: P): CryptoSWRResponse<D, R>;
}

export interface CryptoHookFactory<D = any, R = any, P = any> {
    (dependencies: Partial<Web3Dependencies>): CryptoHandlerHook<P, R, D>;
}
