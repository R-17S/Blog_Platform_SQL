import { Inject, Injectable } from '@nestjs/common';
import { CommentLikeSqlEntity } from '../domain/comment.like-scheme';
import { Pool } from 'pg';

@Injectable()
export class CommentLikesRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async findByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<CommentLikeSqlEntity | null> {
    const result = await this.pool.query<CommentLikeSqlEntity>(
      `
      SELECT *
      FROM "CommentLikes"
      WHERE "commentId" = $1 AND "userId" = $2
      `,
      [commentId, userId],
    );

    return result.rows[0] ?? null;
  }

  async createLike(like: CommentLikeSqlEntity): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO "CommentLikes" (
        "commentId", "userId", "userLogin",
        "status", "createdAt"
      )
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        like.commentId,
        like.userId,
        like.userLogin,
        like.status,
        like.createdAt,
      ],
    );
  }

  async updateLike(like: CommentLikeSqlEntity): Promise<void> {
    await this.pool.query(
      `
      UPDATE "CommentLikes"
      SET "status" = $3,
          "createdAt" = $4
      WHERE "commentId" = $1 AND "userId" = $2
      `,
      [like.commentId, like.userId, like.status, like.createdAt],
    );
  }

  async deleteLike(commentId: string, userId: string): Promise<void> {
    await this.pool.query(
      `
      DELETE FROM "CommentLikes"
      WHERE "commentId" = $1 AND "userId" = $2
      `,
      [commentId, userId],
    );
  }
}
