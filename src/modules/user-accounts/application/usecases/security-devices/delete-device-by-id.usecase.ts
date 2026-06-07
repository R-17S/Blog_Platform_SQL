import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SecurityDevicesRepository } from '../../../infrastructure/devices.repositories';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteDeviceByIdCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase
  implements ICommandHandler<DeleteDeviceByIdCommand>
{
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
  ) {}

  async execute({ userId, deviceId }: DeleteDeviceByIdCommand): Promise<void> {
    const device =
      await this.securityDevicesRepository.findByDeviceId(deviceId);
    if (!device)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device not found',
        extensions: [{ key: 'deviceId', message: 'Device not found' }],
      });

    if (device.userId.toString() !== userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Device does not belong to this user',
        extensions: [
          { key: 'userId', message: 'Device does not belong to this user' },
        ],
      });

    await this.securityDevicesRepository.deleteDevice(deviceId);
  }
}
