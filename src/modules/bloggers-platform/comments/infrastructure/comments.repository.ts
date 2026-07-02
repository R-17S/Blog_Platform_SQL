import { Inject, Injectable } from '@nestjs/common';
import { CommentSqlEntity } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';

@Injectable()
export class CommentsRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async createComment(comment: CommentSqlEntity): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO "Comments" (
        "id", "postId", "content",
        "userId", "userLogin",
        "createdAt", "updatedAt", "deletedAt"
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        comment.id,
        comment.postId,
        comment.content,
        comment.userId,
        comment.userLogin,
        comment.createdAt,
        comment.updatedAt,
        comment.deletedAt,
      ],
    );
  }

  async updateComment(comment: CommentSqlEntity): Promise<void> {
    await this.pool.query(
      `
      UPDATE "Comments"
      SET
        "content" = $2,
        "updatedAt" = $3,
      WHERE "id" = $1
      `,
      [
        comment.id,
        comment.content,
        comment.updatedAt,
      ],
    );
  }

  async findById(id: string): Promise<CommentSqlEntity | null> {
    const result = await this.pool.query<CommentSqlEntity>(
      `
      SELECT *
      FROM "Comments"
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async checkCommentExistsOrError(id: string): Promise<void> {
    const result = await this.pool.query(
      `
      SELECT 1
      FROM "Comments"
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [id],
    );

    if (result.rowCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }
  }

  async softDelete(id: string): Promise<void> {
    await this.pool.query(
      `
      UPDATE "Comments"
      SET "deletedAt" = NOW()
      WHERE "id" = $1
      `,
      [id],
    );
  }

  async deleteAll(): Promise<void> {
    await this.pool.query(`TRUNCATE "Comments" CASCADE`);
  }
}
