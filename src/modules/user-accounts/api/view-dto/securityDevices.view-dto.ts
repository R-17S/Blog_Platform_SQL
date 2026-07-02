import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { SecurityDeviceSqlEntity } from '../../domain/securityDevices.entity';

export class DevicesViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(devices: SecurityDeviceSqlEntity): DevicesViewModel {
    return {
      ip: devices.ip.toString(),
      title: devices.title,
      lastActiveDate: devices.lastActiveDate,
      deviceId: devices.deviceId,
    };
  }
}

export class DevicesViewPaginated extends PaginatedViewDto<
  DevicesViewModel[]
> {}
