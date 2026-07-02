import { Inject, Injectable } from '@nestjs/common';
import { MeViewDto } from '../../api/view-dto/users.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';

@Injectable()
export class AuthQueryRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.pool.query(
      `
    SELECT "id", "email", "login"
    FROM "Users"
    WHERE "id" = $1 AND "deletedAt" IS NULL
    `,
      [userId],
    );
    if (!user.rows[0]) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }
    return MeViewDto.mapToView(user);
  }
}
