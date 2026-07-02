import { Inject, Injectable } from '@nestjs/common';
import { MeViewDto, UserViewModel } from '../../api/view-dto/users.view-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';

@Injectable()
export class AuthQueryRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async me(userId: string): Promise<MeViewDto> {
    const result = await this.pool.query<UserViewModel>(
      `
    SELECT "id", "email", "login", "createdAt"
    FROM "Users"
    WHERE "id" = $1 AND "deletedAt" IS NULL
    `,
      [userId],
    );
    const user = result.rows[0];
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid username or password',
      });
    }
    return MeViewDto.mapToView(user);
  }
}
