import { PostLikeSqlEntity } from '../domain/post.like-scheme';
import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PostLikesRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async createLike(like: PostLikeSqlEntity): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO "PostLikes" (
        "userId", "postId", "userLogin", "status", "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [like.userId, like.postId, like.userLogin, like.status, like.createdAt],
    );
  }

  async updateLike(like: PostLikeSqlEntity): Promise<void> {
    await this.pool.query(
      `
      UPDATE "PostLikes"
      SET "status" = $3,
          "createdAt" = $4
      WHERE "userId" = $1 AND "postId" = $2
      `,
      [like.userId, like.postId, like.status, like.createdAt],
    );
  }

  async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<PostLikeSqlEntity | null> {
    const result = await this.pool.query<PostLikeSqlEntity>(
      `
      SELECT *
      FROM "PostLikes"
      WHERE "postId" = $1 AND "userId" = $2
      `,
      [postId, userId],
    );

    return result.rows[0] ?? null;
  }

  async deleteLike(postId: string, userId: string): Promise<void> {
    await this.pool.query(
      `
      DELETE FROM "PostLikes"
      WHERE "postId" = $1 AND "userId" = $2
      `,
      [postId, userId],
    );
  }

  async deleteAll(): Promise<void> {
    await this.pool.query(`TRUNCATE "PostLikes" CASCADE`);
  }
}
