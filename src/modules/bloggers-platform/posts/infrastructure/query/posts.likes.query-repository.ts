import { Inject, Injectable } from '@nestjs/common';
import { NewestLikeViewModel } from '../../dto/newest-like-view-model';
import {
  LikeStatusTypes,
  PostViewModel,
} from '../../api/view-dto/posts.view-dto';
import { Pool } from 'pg';
import { PostSqlEntity } from '../../domain/post.entity';

@Injectable()
export class PostLikesQueryRepository {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async getStatusesForPosts(
    userId: string,
    postIds: string[],
  ): Promise<Record<string, LikeStatusTypes>> {
    if (postIds.length === 0) return {};

    const result = await this.pool.query<{
      postid: string;
      status: LikeStatusTypes;
    }>(
      `
      SELECT "postId", "status"
      FROM "PostLikes"
      WHERE "userId" = $1 AND "postId" = ANY($2)
      `,
      [userId, postIds],
    );

    const map: Record<string, LikeStatusTypes> = {};
    for (const row of result.rows) {
      map[row.postid] = row.status;
    }
    return map;
  }

  async getNewestLikesForPosts(
    postIds: string[],
  ): Promise<Record<string, NewestLikeViewModel[]>> {
    if (postIds.length === 0) return {};

    const result = await this.pool.query<{
      postid: string;
      userid: string;
      userlogin: string;
      createdаt: string;
    }>(
      `
          SELECT "postId", "userId", "userLogin", "createdAt"
          FROM "PostLikes"
          WHERE "postId" = ANY($1) AND "status" = 'Like'
          ORDER BY "createdAt" DESC
      `,
      [postIds],
    );

    const map: Record<string, NewestLikeViewModel[]> = {};

    for (const row of result.rows) {
      if (!map[row.postid]) map[row.postid] = [];

      if (map[row.postid].length < 3) {
        map[row.postid].push({
          userId: row.userid,
          login: row.userlogin,
          addedAt: new Date(row.createdаt),
        });
      }
    }

    return map;
  }

  async getLikesCountForPosts(postIds: string[]) {
    if (postIds.length === 0) return {};

    const result = await this.pool.query<{ postid: string; count: string }>(
      `
      SELECT "postId", COUNT(*) AS count
      FROM "PostLikes"
      WHERE "postId" = ANY($1) AND "status" = 'Like'
      GROUP BY "postId"
      `,
      [postIds],
    );

    const map: Record<string, number> = {};
    for (const row of result.rows) {
      map[row.postid] = Number(row.count);
    }
    return map;
  }

  async getDislikesCountForPosts(postIds: string[]) {
    if (postIds.length === 0) return {};

    const result = await this.pool.query<{ postid: string; count: string }>(
      `
      SELECT "postId", COUNT(*) AS count
      FROM "PostLikes"
      WHERE "postId" = ANY($1) AND "status" = 'Dislike'
      GROUP BY "postId"
      `,
      [postIds],
    );

    const map: Record<string, number> = {};
    for (const row of result.rows) {
      map[row.postid] = Number(row.count);
    }
    return map;
  }

  async enrichPostsWithLikes(posts: PostSqlEntity[], userId?: string): Promise<PostViewModel[]> {
    const postIds = posts.map((p) => p.id);

    const [statusesMap, newestLikesMap, likesCountMap, dislikesCountMap] =
      await Promise.all([
        userId ? this.getStatusesForPosts(userId, postIds) : {},
        this.getNewestLikesForPosts(postIds),
        this.getLikesCountForPosts(postIds),
        this.getDislikesCountForPosts(postIds),
      ]);

    return posts.map((post) =>
      PostViewModel.mapToView(
        post,
        statusesMap[post.id] ?? LikeStatusTypes.None,
        newestLikesMap[post.id] ?? [],
        likesCountMap[post.id] ?? 0,
        dislikesCountMap[post.id] ?? 0,
      ),
    );
  }
}
