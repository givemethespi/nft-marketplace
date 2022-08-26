import {
    createContext,
    FunctionComponent,
    useContext,
    useEffect,
    useState
} from 'react';
import { IWeb3State } from '@interfaces/web3';
import { ethers } from 'ethers';
import {
    createDefaultState,
    createWeb3State,
    loadContract
} from '@providers/web3/utils';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { NftMarketContract } from '@interfaces/nftMarketContract';

const pageReload = () => {
    window.location.reload();
};

const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
    const isLocked = !(await ethereum._metamask.isUnlocked());
    if (isLocked) pageReload();
};

const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
    ethereum.on('chainChanged', pageReload);
    ethereum.on('accountsChanged', handleAccount(ethereum));
};

const removeGlobalListeners = (ethereum?: MetaMaskInpageProvider) => {
    ethereum?.removeListener('chainChanged', pageReload);
    ethereum?.removeListener('accountsChanged', handleAccount);
};

const Web3Context = createContext<IWeb3State>(createDefaultState());

const Web3Provider: FunctionComponent<any> = ({ children }) => {
    const [web3Api, setWeb3Api] = useState<IWeb3State>(createDefaultState());

    useEffect(() => {
        try {
            const provider = new ethers.providers.Web3Provider(
                window.ethereum as any
            );

            setGlobalListeners(window.ethereum);

            loadContract('NFTMarket', provider).then(contract => {
                const signer = provider.getSigner();
                const signedContract = contract.connect(signer);
                setWeb3Api(
                    createWeb3State({
                        ethereum: window.ethereum,
                        provider,
                        contract:
                            signedContract as unknown as NftMarketContract,
                        isLoading: false
                    })
                );
            });
        } catch (e: any) {
            setWeb3Api(api =>
                createWeb3State({ ...(api as any), isLoading: false })
            );
        }

        return () => {
            removeGlobalListeners(window.ethereum);
        };
    }, []);

    return (
        <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
    );
};

export const useWeb3 = () => {
    return useContext(Web3Context);
};

export default Web3Provider;
