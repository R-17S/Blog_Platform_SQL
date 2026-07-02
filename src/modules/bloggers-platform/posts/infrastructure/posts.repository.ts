import { Inject, Injectable } from '@nestjs/common';

import { PostSqlEntity } from '../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';

@Injectable()
export class PostsRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async findById(id: string): Promise<PostSqlEntity | null> {
    const result = await this.pool.query<PostSqlEntity>(
      `
      SELECT *
      FROM "Posts"
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async checkPostExistsOrError(id: string): Promise<void> {
    const result = await this.pool.query(
      `
      SELECT 1
      FROM "Posts"
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
  }

  async deleteAll(): Promise<void> {
    await this.pool.query(`TRUNCATE "Posts" CASCADE`);
  }

  async softDelete(id: string): Promise<void> {
    await this.pool.query(
      `
      UPDATE "Posts"
      SET "deletedAt" = NOW()
      WHERE "id" = $1
      `,
      [id],
    );
  }

  async findByBlogId(blogId: string): Promise<PostSqlEntity[]> {
    const result = await this.pool.query<PostSqlEntity>(
      `
      SELECT *
      FROM "Posts"
      WHERE "blogId" = $1 AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
      `,
      [blogId],
    );

    return result.rows;
  }

  async createPost(post: PostSqlEntity): Promise<void> {
    await this.pool.query<PostSqlEntity>(
      `
      INSERT INTO "Posts" (
        "id", "title", "shortDescription", "content",
        "blogId", "blogName",
        "likesCount", "dislikesCount",
        "createdAt", "updatedAt", "deletedAt"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.likesCount,
        post.dislikesCount,
        post.createdAt,
        post.updatedAt,
        post.deletedAt,
      ],
    );
  }

  async updatePost(post: PostSqlEntity): Promise<void> {
    await this.pool.query(
      `
      UPDATE "Posts"
      SET
        "title" = $2,
        "shortDescription" = $3,
        "content" = $4,
        "blogId" = $5,
        "blogName" = $6,
        "likesCount" = $7,
        "dislikesCount" = $8,
        "updatedAt" = $9,
        "deletedAt" = $10
      WHERE "id" = $1
      `,
      [
        post.id,
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.likesCount,
        post.dislikesCount,
        post.updatedAt,
        post.deletedAt,
      ],
    );
  }
}
