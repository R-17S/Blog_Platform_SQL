import { Inject, Injectable } from '@nestjs/common';

import {  SecurityDeviceSqlEntity } from '../../domain/securityDevices.entity';
import { DevicesViewModel } from '../../api/view-dto/securityDevices.view-dto';
import { Pool } from 'pg';

@Injectable()
export class SecurityDevicesQueryRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async getAllDevices(userId: string): Promise<DevicesViewModel[]> {
    const result = await this.pool.query<SecurityDeviceSqlEntity>(
      `
      SELECT *
      FROM "SecurityDevices"
      WHERE "userId" = $1
      ORDER BY "lastActiveDate" DESC
      `,
      [userId],
    );

    return result.rows.map((device) =>
      DevicesViewModel.mapToView({
        ip: device.ip,
        title: device.title,
        lastActiveDate: device.lastActiveDate,
        deviceId: device.deviceId,
      }),
    );
  }
}
