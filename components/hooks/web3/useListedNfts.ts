import useSWR from 'swr';
import { CryptoHookFactory } from '@interfaces/hooks';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

type useListedNftsResponse = {
    buyNFT: (tokenId: number, value: number) => void;
};

type ListedNftsHookFactory = CryptoHookFactory<INFT[], useListedNftsResponse>;

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>;

export const hookFactory: ListedNftsHookFactory =
    ({ contract }) =>
    () => {
        const { data, ...res } = useSWR(
            contract ? 'web3/useListedNfts' : null,
            async () => {
                const nfts = [] as INFT[];
                const coreNfts = await contract!.getAllNFTsOnSale();

                for (let i = 0; i < coreNfts.length; i++) {
                    const item = coreNfts[i];
                    const tokenURI = await contract!.tokenURI(item.tokenId);
                    const metaRes = await fetch(tokenURI);
                    const meta = await metaRes.json();

                    nfts.push({
                        ...item,
                        price: parseFloat(ethers.utils.formatEther(item.price)),
                        tokenId: item.tokenId.toNumber(),
                        meta
                    });
                }

                return nfts;
            },
            {
                revalidateOnFocus: false,
                shouldRetryOnError: false
            }
        );

        const _contract = contract;
        const buyNFT = useCallback(
            async (tokenId: number, value: number) => {
                try {
                    const res = await _contract!.buyNFT(tokenId, {
                        value: ethers.utils.parseEther(value.toString())
                    });

                    await toast.promise(res!.wait(), {
                        pending: 'Buying NFT...',
                        success: 'You got the NFT ! Got to profile page',
                        error: 'Error in buy'
                    });
                } catch (e: any) {
                    console.error(e.message);
                }
            },
            [_contract]
        );

        return {
            ...res,
            buyNFT,
            data: data || []
        };
    };
