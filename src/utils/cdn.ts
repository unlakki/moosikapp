import { Readable } from 'stream';
import Crypto from 'crypto';
import JWT from 'jsonwebtoken';
import request, { CoreOptions } from 'request';
import FileType from 'file-type';
import HttpErrors from 'http-errors';

const { JWT_SECRET, CDN_SERVER = '' } = process.env;

export default async (contentType: string, stream: Readable): Promise<string> => {
  const readable = await FileType.stream(stream);

  if (readable.fileType?.mime !== contentType) {
    throw new HttpErrors.BadRequest('Provided header `Content-Type` and file type does not match.');
  }

  const uploadTarget = JWT.sign({
    hex: Crypto.randomBytes(6).toString('hex'),
  }, String(JWT_SECRET), { expiresIn: 1800 });
  const targetUri = `${CDN_SERVER}/upload-target/${uploadTarget}`;

  const requestOptions: CoreOptions = {
    headers: {
      'content-type': contentType,
    },
  };

  return new Promise((resolve, reject) => {
    stream.pipe(
      request.put(targetUri, requestOptions, async (uploadError, uploadResult, uploadMsg) => {
        if (uploadError) {
          reject(uploadError);
          return;
        }

        switch (uploadResult.statusCode) {
          case 201: {
            resolve(uploadMsg);
            break;
          }
          default:
            reject(new HttpErrors[uploadResult.statusCode](uploadMsg));
        }
      }),
    );
  });
};
