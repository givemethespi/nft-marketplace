import { Contract, ethers, providers } from 'ethers';
import { setupHooks } from '@hooks/web3/setupHooks';
import { Web3Dependencies } from '@interfaces/hooks';

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID;

export const createDefaultState = () => {
    return {
        ethereum: null,
        provider: null,
        contract: null,
        isLoading: true,
        hooks: setupHooks({ isLoading: true } as any)
    };
};

export const loadContract = async (
    name: string,
    provider: providers.Web3Provider
): Promise<Contract> => {
    if (!NETWORK_ID) return Promise.reject('Network id is not defined');

    const res = await fetch('/contracts/' + name + '.json');
    const Artifact = await res.json();

    if (Artifact.networks[NETWORK_ID].address) {
        return new ethers.Contract(
            Artifact.networks[NETWORK_ID].address,
            Artifact.abi,
            provider
        );
    } else {
        return Promise.reject('Network not found');
    }
};

export const createWeb3State = ({
    ethereum,
    provider,
    contract,
    isLoading
}: Web3Dependencies) => {
    return {
        ethereum,
        provider,
        contract,
        isLoading,
        hooks: setupHooks({ ethereum, provider, contract, isLoading })
    };
};
