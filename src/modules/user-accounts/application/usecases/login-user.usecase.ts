import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../../constans/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../../domain/user.entity';
import { randomUUID } from 'node:crypto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Devices,
  type DevicesModelType,
} from '../../domain/securityDevices.entity';
import { SecurityDevicesRepository } from '../../infrastructure/devices.repositories';

export class LoginUserCommand {
  constructor(
    public readonly user: UserDocument,
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
    @InjectModel(Devices.name) private readonly devicesModel: DevicesModelType,
  ) {}

  async execute({
    user,
    ip,
    title,
  }: LoginUserCommand): Promise<{ accessToken: string; refreshToken: string }> {
    const deviceId = randomUUID();
    const userId = user._id.toString();
    //const lastActiveDate = new Date();

    const refreshToken = this.refreshTokenContext.sign({
      id: user._id.toString(),
      deviceId,
    });

    const payload = this.refreshTokenContext.decode(refreshToken);
    const lastActiveDate = new Date(payload.iat * 1000);

    const newDevices = this.devicesModel.createInstance(
      userId,
      deviceId,
      ip,
      title,
      lastActiveDate,
    );

    await this.securityDevicesRepository.save(newDevices);

    const accessToken = this.accessTokenContext.sign({
      id: user._id.toString(),
      login: user.login,
    });

    // console.log('refreshToken', refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
