import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    // super({
    //   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    //   secretOrKey: 'rt-secret', //TODO make this is env,
    //   passReqToCallback: true,
    // });
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: 'rt-secret', //TODO make this is env,
      passReqToCallback: true,
    });
  }
  validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.headers.authorization.replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
