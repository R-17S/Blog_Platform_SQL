import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constans/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';

import { randomUUID } from 'node:crypto';


import { SecurityDevicesRepository } from '../../infrastructure/devices.repositories';
import { UserSqlEntity } from '../../domain/user.entity';
import { SecurityDeviceSqlEntity } from '../../domain/securityDevices.entity';

export class LoginUserCommand {
  constructor(
    public readonly user: UserSqlEntity,
    public readonly ip: string,
    public readonly title: string,
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ user, ip, title }: LoginUserCommand) {
    const deviceId = randomUUID();
    const userId = user.id;

    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId,
    });

    const payload = this.refreshTokenContext.decode(refreshToken) as {
      iat: number;
    };
    const lastActiveDate = new Date(payload.iat * 1000);

    const device: SecurityDeviceSqlEntity = {
      id: randomUUID(),
      userId,
      deviceId,
      ip,
      title,
      lastActiveDate: lastActiveDate.toISOString(),
      createdAt: new Date().toISOString(),
    };

    await this.securityDevicesRepository.create(device);

    const accessToken = this.accessTokenContext.sign({
      id: userId,
      login: user.login,
    });

    return { accessToken, refreshToken };
  }
}
