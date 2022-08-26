import { NextPage } from 'next';
import BaseLayout from '@ui/layout/BaseLayout';

const About: NextPage = () => {
    return (
        <BaseLayout>
            <div className='relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-16 lg:pb-28 lg:px-8'>
                <div className='relative'>
                    <div className='text-center mb-4'>
                        <h2 className='text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl'>
                            About
                        </h2>
                    </div>
                    <p>
                        This project was made by{' '}
                        <a
                            href='https://maespirit.fr'
                            target='_blank'
                            className='text-blue-700'
                            rel='noreferrer'
                        >
                            Maespirit
                        </a>{' '}
                        as a learning aid for web3/solidity. You can find the
                        sources on{' '}
                        <a
                            href='https://github.com/givemethespi/nft-marketplace'
                            target='_blank'
                            className='text-blue-700'
                            rel='noreferrer'
                        >
                            Github
                        </a>
                        .<br />
                        It is a marketplace where you can upload an image and
                        mint an NFT from. You also can buy any any listed item,
                        to keep it or to sell later.
                    </p>
                    <p className='text-gray-500'>
                        #typescript #react #nextjs #solidity #ipfs #ethersjs
                    </p>
                </div>
                <div className='mt-4'>
                    <h3 className='text-xl tracking-tight font-extrabold text-gray-900'>
                        Architecture
                    </h3>
                    <ul className='list-disc ml-5'>
                        <li>Development and production environments</li>
                        <li>
                            Ganache and Ropsten deployments with Truffle and
                            Infura
                        </li>
                        <li>Next.js API</li>
                        <li>Contract testing with Truffle</li>
                    </ul>
                </div>
                <div className='mt-4'>
                    <h3 className='text-xl tracking-tight font-extrabold text-gray-900'>
                        Contract
                    </h3>
                    <ul className='list-disc ml-5'>
                        <li>ERC721 base from @openzeppelin</li>
                        <li>
                            Administrator functionalities like listing price
                        </li>
                        <li>Create NFTs</li>
                        <li>List NFTs</li>
                        <li>Place NFTs on sale</li>
                        <li>Get your own NFTs</li>
                        <li>Buy NFT</li>
                    </ul>
                </div>
                <div className='mt-4'>
                    <h3 className='text-xl tracking-tight font-extrabold text-gray-900'>
                        Security
                    </h3>
                    <ul className='list-disc ml-5'>
                        <li>Sign messages to verify addresses</li>
                        <li>Iron sessions</li>
                        <li>onlyOwner implementations</li>
                        <li>Verifications in client, API, and contract</li>
                    </ul>
                </div>
                <div className='mt-4'>
                    <h3 className='text-xl tracking-tight font-extrabold text-gray-900'>
                        And more...
                    </h3>
                    <ul className='list-disc ml-5'>
                        <li>User account detection</li>
                        <li>Network detection</li>
                        <li>Upload to Pinata IPFS</li>
                        <li>
                            See all on{' '}
                            <a
                                href='https://github.com/givemethespi/nft-marketplace'
                                target='_blank'
                                className='text-blue-700'
                                rel='noreferrer'
                            >
                                Github
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </BaseLayout>
    );
};

export default About;
