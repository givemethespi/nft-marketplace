import useSWR from 'swr';
import { CryptoHookFactory } from '@interfaces/hooks';
import { useEffect } from 'react';

type useAccountResponse = {
    connect: () => void;
    isLoading: boolean;
    isInstalled: boolean;
};

type AccountHookFactory = CryptoHookFactory<string, useAccountResponse>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

export const hookFactory: AccountHookFactory =
    ({ provider, ethereum, isLoading }) =>
    () => {
        const { data, mutate, isValidating, ...res } = useSWR(
            provider ? 'web3/useAccount' : null,
            async () => {
                const accounts = await provider!.listAccounts();
                const account = accounts[0];
                if (!account)
                    throw 'Cannot retrieve account ! Connect to web3 wallet';
                return account;
            },
            {
                revalidateOnFocus: false
            }
        );

        useEffect(() => {
            ethereum?.on('accountsChanged', handleAccountsChanged);
            return () => {
                ethereum?.removeListener(
                    'accountsChanged',
                    handleAccountsChanged
                );
            };
        });

        const handleAccountsChanged = (...args: unknown[]) => {
            const accounts = args[0] as string[];
            if (accounts.length === 0) {
                console.error('Please connect');
            } else if (accounts[0] !== data) {
                mutate(accounts[0]);
            }
        };

        const connect = async () => {
            try {
                ethereum?.request({ method: 'eth_requestAccounts' });
            } catch (e) {
                console.error(e);
            }
        };

        return {
            ...res,
            data,
            isValidating,
            isLoading: isLoading as boolean,
            isInstalled: ethereum?.isMetaMask || false,
            mutate,
            connect
        };
    };
