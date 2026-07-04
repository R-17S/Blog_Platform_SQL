import { Inject, Injectable } from '@nestjs/common';
import { UserSqlEntity } from '../domain/user.entity';
import { Pool } from 'pg';

@Injectable()
export class UsersRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async findById(id: string): Promise<UserSqlEntity | null> {
    const result = await this.pool.query<UserSqlEntity>(
      `
      SELECT "id", "login", "email", "passwordHash", "createdAt", "deletedAt"
      FROM "Users"
      WHERE id = $1
    `,
      [id],
    );

    if (result.rows.length === 0) return null;

    const user = result.rows[0];

    // Если ты используешь soft-delete
    if (user.deletedAt) return null;

    return user;
  }

  async createUser(user: UserSqlEntity): Promise<void> {
    try {
      await this.pool.query(
        `
          INSERT INTO "Users" (
            "id",
            "login",
            "email",
            "passwordHash",
            "confirmationCode", 
            "confirmationExpiration",
            "isConfirmed",
            "recoveryCode",
            "recoveryExpiration",
            "createdAt",
            "deletedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          user.id,
          user.login,
          user.email,
          user.passwordHash,
          user.confirmationCode,
          user.confirmationExpiration,
          user.isConfirmed,
          user.recoveryCode,
          user.recoveryExpiration,
          user.createdAt,
          user.deletedAt,
        ],
      );
    } catch (error) {
      console.error('🔥 Ошибка при записи пользователя в БД:', error);
      throw error;
    }
  }

  async findByLogin(login: string): Promise<UserSqlEntity | null> {
    const result = await this.pool.query<UserSqlEntity>(
      `SELECT * FROM "Users" WHERE login = $1`,
      [login],
    );
    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserSqlEntity | null> {
    const result = await this.pool.query<UserSqlEntity>(
      `SELECT * FROM "Users" WHERE email = $1`,
      [email],
    );
    return result.rows[0] ?? null;
  }

  async exists(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `
        SELECT 1
        FROM "Users"
        WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.pool.query(
      `
        UPDATE "Users"
        SET "deletedAt" = NOW()
        WHERE id = $1`,
      [userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  async deleteAll(): Promise<void> {
    await this.pool.query(`DELETE FROM "Users"`);
  }

  async findByConfirmationCode(code: string): Promise<UserSqlEntity | null> {
    const result = await this.pool.query<UserSqlEntity>(
      `SELECT * FROM "Users" WHERE "confirmationCode" = $1`,
      [code],
    );
    return result.rows[0] ?? null;
  }

  async findByRecoveryCode(code: string): Promise<UserSqlEntity | null> {
    const result = await this.pool.query<UserSqlEntity>(
      `SELECT * FROM "Users" WHERE "recoveryCode" = $1`,
      [code],
    );
    return result.rows[0] ?? null;
  }

  async updateConfirmationCode(userId: string, code: string, expiration: Date) {
    await this.pool.query(
      `
    UPDATE "Users"
    SET "confirmationCode" = $1,
        "confirmationExpiration" = $2
    WHERE id = $3
    `,
      [code, expiration, userId],
    );
  }

  async confirmUser(userId: string) {
    await this.pool.query(
      `
        UPDATE "Users"
        SET "isConfirmed" = true,
            "confirmationCode" = null
        WHERE id = $1
      `,
      [userId],
    );
  }

  async updatePasswordAndClearRecovery(userId: string, newHash: string) {
    await this.pool.query(
      `
    UPDATE "Users"
    SET "passwordHash" = $1,
        "recoveryCode" = null,
        "recoveryExpiration" = null
    WHERE id = $2
    `,
      [newHash, userId],
    );
  }

  async updateRecoveryData(
    userId: string,
    recoveryCode: string,
    recoveryExpiration: Date,
  ) {
    await this.pool.query(
      `
      UPDATE "Users"
      SET "recoveryCode" = $1,
          "recoveryExpiration" = $2
      WHERE id = $3
      `,
      [recoveryCode, recoveryExpiration, userId],
    );
  }
}
