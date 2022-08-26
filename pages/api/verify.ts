import { v4, v4 as uuid } from 'uuid';
import { Session } from 'next-iron-session';
import {
    addressCheckMiddleware,
    contractAddress,
    pinataApiKey,
    pinataSecretApiKey,
    withSession
} from './utils';
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { uuidV4 } from '@ethersproject/json-wallets/lib/utils';

export default withSession(
    async (
        req: NextApiRequest & { session: Session },
        res: NextApiResponse
    ) => {
        if (req.method == 'POST') {
            try {
                const body = req.body;
                const nft = body.nft as INFTMeta;

                if (!nft.name || !nft.description || !nft.attributes) {
                    return res
                        .status(422)
                        .send({ message: 'no full data for nft' });
                }

                await addressCheckMiddleware(req, res);

                const data = JSON.stringify({
                    pinataOptions: {
                        cidVersion: 1
                    },
                    pinataMetadata: {
                        name: v4()
                    },
                    pinataContent: nft
                });

                const config = {
                    method: 'post',
                    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                    headers: {
                        'Content-Type': 'application/json',
                        pinata_api_key: pinataApiKey,
                        pinata_secret_api_key: pinataSecretApiKey
                    },
                    data: data
                };

                const jsonRes = await axios(config);

                return res.status(200).send(jsonRes.data);
            } catch {
                return res
                    .status(422)
                    .send({ message: 'cannot verify signature' });
            }
        } else if (req.method == 'GET') {
            try {
                const message = {
                    contractAddress,
                    id: uuid()
                };
                req.session.set('message-session', message);
                await req.session.save();
                return res.json(message);
            } catch {
                return res.status(422).send({ message: 'cannot generate msg' });
            }
        } else return res.status(200).json({ message: 'invalid api method' });
    }
);
