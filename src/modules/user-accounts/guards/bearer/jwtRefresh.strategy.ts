import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserCookiesDto } from '../dto/user-cookies.dto';
import { AuthService } from '../../application/auth.service';
import { CoreConfig } from '../../../../core/core.config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly coreConfig: CoreConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          console.log('🔥 [Extractor] req.headers.cookie:', req.headers.cookie);
          console.log(
            '🔥 [Strategy] refreshTokenSecret:',
            coreConfig.refreshTokenSecret,
          );
          const raw = req.headers.cookie;
          if (!raw) return null;

          const cookies = Object.fromEntries(
            raw.split(';').map((v) => v.trim().split('=')),
          );
          console.log('🔥 [Extractor] parsed cookies:', cookies);

          return cookies['refreshToken'] ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: coreConfig.refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: UserCookiesDto,
  ): Promise<UserCookiesDto> {
    await this.authService.checkRefreshToken(payload.deviceId, payload.iat);
    // payload содержит id и deviceId
    return payload;
  }
}
