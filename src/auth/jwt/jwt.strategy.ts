import {
  Injectable,
} from '@nestjs/common';
import {
  PassportStrategy,
} from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import {
  jwtConstants,
} from './jwt.constants.js';

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy) {

  constructor() {

    super({

      jwtFromRequest:
        ExtractJwt
          .fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        jwtConstants.secret,

    });
  }

  async validate(
    payload: any,
  ) {

    return {

      userId:
        payload.id,

      name:
        payload.name,

      email:
        payload.email,

      role:
        payload.role,

      sedeId:
        payload.sedeId ?? null,

    };
  }
}