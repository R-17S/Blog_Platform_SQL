import {
  BlogsViewPaginated,
  BlogViewModel,
} from '../../api/view-dto/blogs.view-dto';
import { BlogInputQuery } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogSqlEntity } from '../../domain/blog.entity';

@Injectable()
export class BlogsQueryRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async getAllBlogs(params: BlogInputQuery): Promise<BlogsViewPaginated> {
    // 1. Фильтр
    const values: any[] = [];
    let where = `WHERE "deletedAt" IS NULL`;

    if (params.searchNameTerm) {
      values.push(`%${params.searchNameTerm}%`);
      where += ` AND "name" ILIKE $${values.length}`;
    }

    const totalCountResult = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(*)
      FROM "Blogs" ${where}
      `,
      values,
    );
    const totalCount = Number(totalCountResult.rows[0].count);

    const allowedSortBy = [
      'id',
      'name',
      'description',
      'websiteUrl',
      'createdAt',
      'isMembership',
    ];
    const sortBy = allowedSortBy.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const sortDirection =
      params.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const offset = params.calculateSkip();
    const limit = params.pageSize;

    const queryParams = [...values, params.pageSize, offset];
    const blogsResult = await this.pool.query<BlogSqlEntity>(
      `
      SELECT *
      FROM "Blog"
      ${where}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT ${limit} OFFSET ${offset}
      `,
      queryParams,
    );

    const blogs = blogsResult.rows;

    return BlogsViewPaginated.mapToView({
      items: blogs.map((blog) => BlogViewModel.mapToView(blog)),
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }

  async getBlogByIdOrError(id: string): Promise<BlogViewModel> {
    const result = await this.pool.query<BlogSqlEntity>(
      `
        SELECT *
        FROM "Blogs"
        WHERE "id" = $1 AND "deletedAt" IS NULL
        `,
      [id],
    );

    const blog = result.rows[0];
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    return BlogViewModel.mapToView(blog);
  }
}
