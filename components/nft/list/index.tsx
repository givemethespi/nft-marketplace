import { FunctionComponent } from 'react';
import NFTItem from '../item';
import { useWeb3 } from '@providers/web3';

const NFTList: FunctionComponent = () => {
    const { hooks } = useWeb3();
    const { data, buyNFT } = hooks.useListedNfts();

    return (
        <div className='mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none'>
            {data?.map(d => (
                <NFTItem key={d.meta.image} item={d} buyNFT={buyNFT} />
            ))}
        </div>
    );
};

export default NFTList;
