import { Session, withIronSession } from 'next-iron-session';
import contract from '../../public/contracts/NFTMarket.json';
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import { NftMarketContract } from '@interfaces/nftMarketContract';
import * as utils from 'ethereumjs-util';

const NETWORKS = {
    '5777': 'Ganache',
    '3': 'Ropsten'
};

type NETWORK = typeof NETWORKS;

const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;
export const contractAddress = contract.networks[targetNetwork].address;
export const pinataApiKey = process.env.PINATA_API_KEY as string;
export const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY as string;

const abi = contract.abi;

export function withSession(handler: any) {
    return withIronSession(handler, {
        password: process.env.SECRET_COOKIE_PASSWORD as string,
        cookieName: 'nft-auth-session',
        cookieOptions: {
            secure: process.env.NODE_ENV == 'production'
        }
    });
}

const url =
    process.env.NODE_ENV === 'production'
        ? process.env.INFURA_ROPSTEN_URL
        : 'http://127.0.0.1:7545';

export const addressCheckMiddleware = async (
    req: NextApiRequest & { session: Session },
    res: NextApiResponse
) => {
    return new Promise(async (resolve, reject) => {
        const message = req.session.get('message-session');
        const provider = new ethers.providers.JsonRpcProvider(url);
        const contract = new ethers.Contract(
            contractAddress,
            abi,
            provider
        ) as unknown as NftMarketContract;

        let nonce: string | Buffer =
            '\x19Ethereum Signed Message:\n' +
            JSON.stringify(message).length +
            JSON.stringify(message);

        nonce = utils.keccak(Buffer.from(nonce, 'utf-8'));
        const { v, r, s } = utils.fromRpcSig(req.body.signature);
        const pubKey = utils.ecrecover(utils.toBuffer(nonce), v, r, s);
        const addressBuffer = utils.pubToAddress(pubKey);
        const address = utils.bufferToHex(addressBuffer);

        if (address != req.body.address) reject('invalid cookie');
        resolve('Correct address');
    });
};
