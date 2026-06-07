import { UserCookiesDto } from '../../../guards/dto/user-cookies.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/devices.repositories';

export class DeleteAllDevicesExceptCurrentCommand {
  constructor(public readonly user: UserCookiesDto) {}
}

@CommandHandler(DeleteAllDevicesExceptCurrentCommand)
export class DeleteAllDevicesExceptCurrentUseCase
  implements ICommandHandler<DeleteAllDevicesExceptCurrentCommand>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ user }: DeleteAllDevicesExceptCurrentCommand): Promise<void> {
    const { id: userId, deviceId: currentDeviceId } = user;
    const devices =
      await this.securityDevicesRepository.findAllByUserId(userId);
    //  Фильтруем все, кроме текущего тут или как то достать только нужные поля из монго?
    const otherDeviceIds = devices
      .filter((device) => device.deviceId !== currentDeviceId)
      .map((device) => device.deviceId);

    await this.securityDevicesRepository.deleteManyByDeviceIds(otherDeviceIds);
  }
}
