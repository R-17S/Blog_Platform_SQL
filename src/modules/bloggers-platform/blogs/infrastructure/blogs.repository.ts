import { Inject, Injectable } from '@nestjs/common';
import { BlogSqlEntity } from '../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';

@Injectable()
export class BlogsRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async createBlog(blog: BlogSqlEntity): Promise<void> {
    await this.pool.query(
      `
    INSERT INTO "Blogs" (
      "id", "name", "description",
      "websiteUrl", "isMembership", "createdAt",
      "updatedAt", "deletedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        blog.id,
        blog.name,
        blog.description,
        blog.websiteUrl,
        blog.isMembership,
        blog.createdAt,
        blog.updatedAt,
        blog.deletedAt,
      ],
    );
  }

  async updateBlog(blog: BlogSqlEntity): Promise<void> {
    await this.pool.query(
      `UPDATE "Blogs"
      SET
      "name" = $2,
      "description" = $3,
      "websiteUrl" = $4,
      "updatedAt" = $5
      WHERE "id" = $1
      `,
      [blog.id, blog.name, blog.description, blog.websiteUrl, blog.updatedAt],
    );
  }

  async findById(id: string): Promise<BlogSqlEntity | null> {
    const result = await this.pool.query<BlogSqlEntity>(
      `
      SELECT *
      FROM "Blogs"
      WHERE id = $1 AND "deletedAt"  IS NULL
      `,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async getBlogNameOrError(id: string): Promise<string> {
    const result = await this.pool.query<{ name: string }>(
      `
      SELECT "name"
      FROM "Blogs"
      WHERE "id" = $1 AND "deletedAt" IS NULL 
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return result.rows[0].name;
  }

  async checkBlogExistsOrError(id: string): Promise<void> {
    const exists = await this.pool.query(
      `
      SELECT 1
      FROM "Blogs"
      WHERE "id" = $1 AND "deletedAt"  IS NULL
      `,
      [id],
    );
    if (exists.rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
  }

  async softDelete(id: string): Promise<void> {
    await this.pool.query(
      `
        UPDATE "Blogs"
        SET "deletedAt" = NOW()
        WHERE "id" = $1
       `,
      [id],
    );
  }

  async deleteAll(): Promise<void> {
    await this.pool.query(`TRUNCATE "Blogs" CASCADE`);
  }
}
