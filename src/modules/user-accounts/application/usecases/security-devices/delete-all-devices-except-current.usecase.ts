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
    const otherDeviceIds =
      await this.securityDevicesRepository.findAllDeviceIdsExceptCurrent(
        userId,
        currentDeviceId,
      );
    if (otherDeviceIds.length > 0) {
      await this.securityDevicesRepository.deleteManyByDeviceIds(
        otherDeviceIds,
      );
    }
  }
}
