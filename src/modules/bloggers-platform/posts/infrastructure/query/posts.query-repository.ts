import { Inject, Injectable } from '@nestjs/common';
import { PostInputQuery } from '../../api/input-dto/get-posts-query-params.input-dto';
import {
  PostsViewPaginated,
  PostViewModel,
} from '../../api/view-dto/posts.view-dto';
import { PostLikesQueryRepository } from './posts.likes.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';
import { PostSqlEntity } from '../../domain/post.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly postLikesRepository: PostLikesQueryRepository,
  ) {}

  async getAllPosts(
    params: PostInputQuery,
    userId?: string,
  ): Promise<PostsViewPaginated> {
    const filter = `p."blogId" = $1 AND p."deletedAt" IS NULL`;

    const totalCountResult = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*)
        FROM "Posts" p
        WHERE ${filter}`,
    );
    const totalCount = Number(totalCountResult.rows[0].count);

    const sortOptions = params.SortOptions(params.sortBy);
    const orderByClause = Object.entries(sortOptions)
      .map(([key, value]) => `"${key}" ${value}`)
      .join(', ');

    const query = `
      SELECT *
      FROM "Posts" p
      WHERE ${filter}
      ORDER BY ${orderByClause}
      LIMIT $2 OFFSET $3
    `;

    const postsResult = await this.pool.query(query, [
      params.pageSize,
      params.calculateSkip(),
    ]);

    const posts = postsResult.rows;

    const items = await this.postLikesRepository.enrichPostsWithLikes(
      posts,
      userId,
    );

    return PostsViewPaginated.mapToView({
      items,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }

  async getPostByIdOrError(
    id: string,
    userId?: string,
  ): Promise<PostViewModel> {
    const result = await this.pool.query<PostSqlEntity>(
      `
      SELECT *
      FROM "Posts"
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [id],
    );

    const post = result.rows[0];
    // сомнительно конечно проверять только что созданый пост
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const items = await this.postLikesRepository.enrichPostsWithLikes(
      [post],
      userId,
    );
    return items[0];
  }

  async getPostsByBlogId(
    id: string,
    params: PostInputQuery,
    userId?: string,
  ): Promise<PostsViewPaginated> {
    const { sortBy, sortDirection, pageSize, pageNumber } = params;
    const filter = `p."blogId" = $1 AND p."deletedAt" IS NULL`;
    const offset = params.calculateSkip();
    // тут получил общее количество
    const totalCountResult = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(*)
      FROM "Posts"
      WHERE ${filter}
      `,
      [id],
    );
    const totalCount = Number(totalCountResult.rows[0].count);
    // получение самих постов с пагинацией и сортировкой
    const postsResult = await this.pool.query(
      `
      SELECT *
      FROM "Posts"
      WHERE ${filter}
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3
      `,
      [id, pageSize, offset],
    );

    const posts = postsResult.rows;

    const items = await this.postLikesRepository.enrichPostsWithLikes(
      posts,
      userId,
    );

    return PostsViewPaginated.mapToView({
      items,
      page: pageNumber,
      pageSize,
      totalCount,
    });
  }
}
