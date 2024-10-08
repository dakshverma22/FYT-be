import { Response } from 'express';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants/jwt.constant';
import { PRODUCTION } from './global.constant';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export function setAuthCookies(
  res: Response,
  tokens: TokenPair,
  clear?: boolean,
): void {
  if (clear) {
    res.clearCookie(ACCESS_TOKEN);
    res.clearCookie(REFRESH_TOKEN);
  }
  res.cookie(ACCESS_TOKEN, tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === PRODUCTION ? 'strict' : 'none',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie(REFRESH_TOKEN, tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === PRODUCTION ? 'strict' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}
