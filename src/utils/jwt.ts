import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWT_EXPIRES_IN } from './constants';

export interface TokenPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as TokenPayload;
}
