import useSWR from 'swr';
import { CryptoHookFactory } from '@interfaces/hooks';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

type useOwnedNftsResponse = {
    listNFT: (tokenId: number, price: number) => void;
};

type OwnedNftsHookFactory = CryptoHookFactory<INFT[], useOwnedNftsResponse>;

export type UseOwnedNftsHook = ReturnType<OwnedNftsHookFactory>;

export const hookFactory: OwnedNftsHookFactory =
    ({ contract }) =>
    () => {
        const { data, ...res } = useSWR(
            contract ? 'web3/useOwnedNfts' : null,
            async () => {
                const nfts = [] as INFT[];
                const coreNfts = await contract!.getOwnedNfts();

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
                shouldRetryOnError: false
            }
        );

        const _contract = contract;

        const listNFT = useCallback(
            async (tokenId: number, price: number) => {
                try {
                    const res = await _contract!.placeNFTOnSale(
                        tokenId,
                        ethers.utils.parseEther(price.toString()),
                        {
                            value: ethers.utils.parseEther('0.025')
                        }
                    );

                    await toast.promise(res!.wait(), {
                        pending: 'Listing NFT...',
                        success: 'Item has ben listed. See marketplace !',
                        error: 'Error in listing'
                    });
                } catch (e: any) {
                    console.error(e.message);
                }
            },
            [_contract]
        );

        return {
            ...res,
            listNFT,
            data: data || []
        };
    };
