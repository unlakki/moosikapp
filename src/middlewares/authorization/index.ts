import { Response, NextFunction } from 'express';
import JWT from 'jsonwebtoken';
import { JWTRecord, AuthorizedRequest, User } from '../../../typings';
import { getUserByUuid } from '../../apis/mongodb/users';

const { JWT_SECRET = '' } = process.env;

export default () => {
  return async (req: AuthorizedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer')) {
      res.status(401).send({ message: 'Invalid authorization.' });
      return;
    }

    const token = authorization.slice(7);

    try {
      req.jwt = JWT.verify(token, JWT_SECRET) as JWTRecord;

      const { password: { timestamp } } = await getUserByUuid(req.jwt.uuid) as User;

      if (new Date(req.jwt.timestamp).getTime() !== timestamp.getTime()) {
        throw new Error('NotAuthorizedError');
      }

      next();
    } catch (e) {
      res.status(403).send({ message: 'Not authorized.' });
    }
  };
}
