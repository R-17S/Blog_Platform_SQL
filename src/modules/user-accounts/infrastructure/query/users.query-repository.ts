import { Inject, Injectable } from '@nestjs/common';
import {
  UsersViewPaginated,
  UserViewModel,
} from '../../api/view-dto/users.view-dto';
import { UserInputQuery } from '../../api/input-dto/get-users-query-params.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';
import { UserSqlEntity } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async getAllUsers(params: UserInputQuery): Promise<UsersViewPaginated> {
    const values: any[] = [];
    let where = `WHERE "deletedAt" IS NULL`;

    if (params.searchLoginTerm && params.searchEmailTerm) {
      values.push(`%${params.searchLoginTerm}%`);
      values.push(`%${params.searchEmailTerm}%`);
      where += ` AND (login ILIKE $${values.length - 1} OR email ILIKE $${values.length})`;
    } else if (params.searchLoginTerm) {
      values.push(`%${params.searchLoginTerm}%`);
      where += ` AND login ILIKE $${values.length}`;
    } else if (params.searchEmailTerm) {
      values.push(`%${params.searchEmailTerm}%`);
      where += ` AND email ILIKE $${values.length}`;
    }

    //const sortBy = params.sortBy ?? 'createdAt'; нормальная иньекция спросить ?

    const allowedSortBy = ['id', 'login', 'email', 'createdAt'];
    const sortBy = allowedSortBy.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const sortDirection =
      params.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const orderByClause =
      sortBy === 'login' || sortBy === 'email'
        ? `ORDER BY "${sortBy}" COLLATE "C" ${sortDirection}`
        : `ORDER BY "${sortBy}" ${sortDirection}`;

    const offset = params.calculateSkip();
    const limit = params.pageSize;

    const totalCountQuery = `
      SELECT COUNT(*) 
      FROM "Users"
      ${where}
    `;
    const totalCountResult = await this.pool.query<{ count: string }>(
      totalCountQuery,
      values,
    );
    const totalCount = Number(totalCountResult.rows[0].count);

    const itemsQuery = `
      SELECT *
      FROM "Users"
      ${where}
      ${orderByClause}
      OFFSET ${offset}
      LIMIT ${limit}
    `;
    const itemsResult = await this.pool.query(itemsQuery, values);
    // console.log(params);
    return UsersViewPaginated.mapToView({
      items: itemsResult.rows.map((u) => UserViewModel.mapToView(u)),
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }

  async getUserByIdOrError(id: string): Promise<UserViewModel> {
    const result = await this.pool.query<UserSqlEntity>(
      `
        SELECT * 
        FROM "Users" 
        WHERE id = $1 AND "deletedAt" IS NULL`,
      [id],
    );

    if (!result.rows[0]) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewModel.mapToView(result.rows[0]);
  }
}
