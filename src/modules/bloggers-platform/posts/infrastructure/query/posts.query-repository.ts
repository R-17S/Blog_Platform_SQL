import { Inject, Injectable } from '@nestjs/common';
import { PostInputQuery } from '../../api/input-dto/get-posts-query-params.input-dto';
import {
  PostsViewPaginated,
  PostViewModel,
  PostWithBlogNameSqlEntity,
} from '../../api/view-dto/posts.view-dto';
import { PostLikesQueryRepository } from './posts.likes.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';

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
    const filter = `p."deletedAt" IS NULL`;
    const allowedSortBy = [
      'id',
      'title',
      'shortDescription',
      'content',
      'likesCount',
      'dislikesCount',
      'createdAt',
      'blogName',
    ];
    const sortBy = allowedSortBy.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';


    const sortDirection =
      params.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    const totalCountResult = await this.pool.query<{ count: string }>(
      `
        SELECT COUNT(*)
        FROM "Posts" p
        WHERE ${filter}`,
    );
    const totalCount = Number(totalCountResult.rows[0].count);

    const query = `
      SELECT *
      FROM "v_posts_with_blog_name" p
      WHERE ${filter}
      ORDER BY p."${sortBy}" ${sortDirection}
      LIMIT $1 OFFSET $2
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
    const result = await this.pool.query<PostWithBlogNameSqlEntity>(
      `
        SELECT *
        FROM "v_posts_with_blog_name" p
        WHERE p."id" = $1 AND p."deletedAt" IS NULL
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
    const { pageSize, pageNumber } = params;
    const filter = `p."blogId" = $1 AND p."deletedAt" IS NULL`;
    const offset = params.calculateSkip();

    const totalCountResult = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(*)
      FROM "Posts" p
      WHERE ${filter}
      `,
      [id],
    );
    const totalCount = Number(totalCountResult.rows[0].count);

    const allowedSortBy = [
      'id',
      'title',
      'shortDescription',
      'content',
      'likesCount',
      'dislikesCount',
      'createdAt',
    ];
    const sortBy = allowedSortBy.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const sortDirection =
      params.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';
    // получение самих постов с пагинацией и сортировкой
    const postsResult = await this.pool.query<PostWithBlogNameSqlEntity>(
      `
        SELECT *
        FROM "v_posts_with_blog_name" p
        WHERE ${filter}
        ORDER BY p."${sortBy}" ${sortDirection} 
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
