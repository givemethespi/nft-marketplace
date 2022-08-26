import {
    addressCheckMiddleware,
    pinataApiKey,
    pinataSecretApiKey,
    withSession
} from './utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-iron-session';
import FormData from 'form-data';
import { v4 } from 'uuid';
import axios from 'axios';

export default withSession(
    async (
        req: NextApiRequest & { session: Session },
        res: NextApiResponse
    ) => {
        if (req.method == 'POST') {
            const { bytes, fileName, contentType } = req.body as FileReq;

            if (!bytes || !fileName || !contentType) {
                return res.status(422).send({ message: 'Invalid image data' });
            }

            await addressCheckMiddleware(req, res);

            const buffer = Buffer.from(Object.values(bytes));
            const fd = new FormData();

            fd.append('file', buffer, {
                contentType,
                filename: fileName + '-' + v4()
            });

            const fileRes = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                fd,
                {
                    maxBodyLength: Infinity,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${fd.getBoundary()}`,
                        pinata_api_key: pinataApiKey,
                        pinata_secret_api_key: pinataSecretApiKey
                    }
                }
            );

            return res.status(200).send(fileRes.data);
        } else return res.status(200).json({ message: 'invalid api method' });
    }
);

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '3mb'
        }
    }
};
