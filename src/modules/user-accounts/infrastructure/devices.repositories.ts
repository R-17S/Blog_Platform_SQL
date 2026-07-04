import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { SecurityDeviceSqlEntity } from '../domain/securityDevices.entity';

@Injectable()
export class SecurityDevicesRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async create(device: SecurityDeviceSqlEntity): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO "SecurityDevices" 
        ("id", "userId", "deviceId", "ip", "title", "lastActiveDate", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        device.id,
        device.userId,
        device.deviceId,
        device.ip,
        device.title,
        device.lastActiveDate,
        device.createdAt,
      ],
    );
  }

  async findAllByUserId(userId: string): Promise<string[]> {
    const result = await this.pool.query<SecurityDeviceSqlEntity>(
      `SELECT * FROM "SecurityDevices" WHERE "userId" = $1`,
      [userId],
    );
    return result.rows.map((r) => r.deviceId);
  }

  async findAllDeviceIdsExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<string[]> {
    const result = await this.pool.query<{ deviceId: string }>(
      `
      SELECT "deiceId"
      FROM "SecurityDevices"
      WHERE "userId" = $1 AND "deviceId" <> $2
      `,
      [userId, currentDeviceId],
    );
    return result.rows.map((r) => r.deviceId);
  }

  async deleteManyByDeviceIds(deviceIds: string[]): Promise<void> {
    await this.pool.query(
      `DELETE FROM "SecurityDevices" WHERE "deviceId" = ANY($1)`,
      [deviceIds],
    );
  }

  async findByDeviceId(
    deviceId: string,
  ): Promise<SecurityDeviceSqlEntity | null> {
    const result = await this.pool.query<SecurityDeviceSqlEntity>(
      `
        SELECT * 
        FROM "SecurityDevices"
        WHERE "deviceId" = $1`,
      [deviceId],
    );
    return result.rows[0] ?? null;
  }

  async deleteDevice(deviceId: string): Promise<void> {
    await this.pool.query(
      `
        DELETE 
        FROM "SecurityDevices"
        WHERE "deviceId" = $1`,
      [deviceId],
    );
  }

  async deleteAll(): Promise<void> {
    await this.pool.query(`DELETE FROM "SecurityDevices"`);
  }

  async updateLastActive(deviceId: string, date: Date): Promise<void> {
    await this.pool.query(
      `
      UPDATE "SecurityDevices"
      SET "lastActiveDate" = $1
      WHERE "deviceId" = $2
      `,
      [date, deviceId],
    );
  }

  async updateLastActiveDate(deviceId: string, date: Date): Promise<void> {
    await this.pool.query(
      `
      UPDATE "SecurityDevices"
      SET "lastActiveDate" = $1
      WHERE "deviceId" = $2
    `,
      [date.toISOString(), deviceId],
    );
  }
}
