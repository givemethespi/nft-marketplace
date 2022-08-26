import useSWR from 'swr';
import { CryptoHookFactory } from '@interfaces/hooks';
import { useEffect } from 'react';

const NETWORKS: { [k: string]: string } = {
    1: 'Ethereum Main Network',
    3: 'Ropsten Test Network',
    4: 'Rinkeby Test Network',
    5: 'Goerli Test Network',
    1337: 'Ganache'
};

const TARGET_CHAIN_ID = process.env.NEXT_PUBLIC_TARGET_CHAIN_ID as string;
const TARGET_NETWORK = NETWORKS[TARGET_CHAIN_ID];

type useNetworkResponse = {
    isLoading: boolean;
    isSupported: boolean;
    targetNetwork: string;
    isConnectedToNetwork: boolean;
};

type NetworkHookFactory = CryptoHookFactory<string, useNetworkResponse>;

export type UseNetworkHook = ReturnType<NetworkHookFactory>;

export const hookFactory: NetworkHookFactory =
    ({ provider, isLoading }) =>
    () => {
        const { data, isValidating, ...res } = useSWR(
            provider ? 'web3/useNetwork' : null,
            async () => {
                const chainId = (await provider!.getNetwork()).chainId;

                if (!chainId || !NETWORKS[chainId])
                    throw 'Cannot retrieve network';
                else return NETWORKS[chainId];
            },
            {
                revalidateOnFocus: false,
                shouldRetryOnError: false
            }
        );

        const isSupported = data === TARGET_NETWORK;

        return {
            ...res,
            data,
            isValidating,
            targetNetwork: TARGET_NETWORK,
            isSupported,
            isConnectedToNetwork: isSupported && !isLoading,
            isLoading: isLoading as boolean
        };
    };
