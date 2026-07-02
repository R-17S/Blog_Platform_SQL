import { Inject, Injectable } from '@nestjs/common';
import {
  CommentsViewPaginated,
  CommentViewModel,
  LikeStatusTypes,
} from '../../api/view-dto/comments.view-dto';
import { CommentLikesQueryRepository } from './comments.likes.query-repository';
import { CommentInputQuery } from '../../api/input-dto/get-comments-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { Pool } from 'pg';
import { CommentSqlEntity } from '../../domain/comment.entity';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @Inject('PG_POOL') private readonly pool: Pool,
    private readonly commentLikesQueryRepository: CommentLikesQueryRepository,
  ) {}

  async getCommentByIdOrError(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel> {
    const result = await this.pool.query<CommentSqlEntity>(
      `
      SELECT *
      FROM "Comments"
      WHERE "id" = $1 AND "deletedAt" IS NULL
      `,
      [id],
    );

    const comment = result.rows[0];

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    const [likesMap, dislikesMap] = await Promise.all([
      this.commentLikesQueryRepository.getLikesCountForComments([id]),
      this.commentLikesQueryRepository.getDislikesCountForComments([id]),
    ]);

    const statusesMap = userId
      ? await this.commentLikesQueryRepository.getStatusesForComments(userId, [
          id,
        ])
      : {};

    const myStatus = statusesMap[id] ?? LikeStatusTypes.None;
    const likesCount = likesMap[id] ?? 0;
    const dislikesCount = dislikesMap[id] ?? 0;

    return CommentViewModel.mapToView(
      comment,
      myStatus,
      likesCount,
      dislikesCount,
    );
  }

  async getCommentsByPostId(
    postId: string,
    params: CommentInputQuery,
    userId?: string,
  ): Promise<CommentsViewPaginated> {
    const { pageSize, pageNumber } = params;
    const offset = params.calculateSkip();

    // 1. totalCount
    const totalCountResult = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(*)
      FROM "Comments"
      WHERE "postId" = $1 AND "deletedAt" IS NULL
      `,
      [postId],
    );
    const totalCount = Number(totalCountResult.rows[0].count);

    const allowedSortBy = ['id', 'content', 'createdAt', 'userId', 'userLogin'];
    const sortBy = allowedSortBy.includes(params.sortBy)
      ? params.sortBy
      : 'createdAt';
    const sortDirection =
      params.sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    // 2. сами комментарии
    const commentsResult = await this.pool.query<CommentSqlEntity>(
      `
      SELECT *
      FROM "Comments"
      WHERE "postId" = $1 AND "deletedAt" IS NULL
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3
      `,
      [postId, pageSize, offset],
    );

    const comments = commentsResult.rows;
    const commentIds = comments.map((c) => c.id);

    // 3. лайки/дизлайки
    const [likesMap, dislikesMap] = await Promise.all([
      this.commentLikesQueryRepository.getLikesCountForComments(commentIds),
      this.commentLikesQueryRepository.getDislikesCountForComments(commentIds),
    ]);

    // 4. myStatus
    const statusesMap = userId
      ? await this.commentLikesQueryRepository.getStatusesForComments(
          userId,
          commentIds,
        )
      : {};

    // 5. маппинг
    const items = comments.map((comment) =>
      CommentViewModel.mapToView(
        comment,
        statusesMap[comment.id] ?? LikeStatusTypes.None,
        likesMap[comment.id] ?? 0,
        dislikesMap[comment.id] ?? 0,
      ),
    );

    return CommentsViewPaginated.mapToView({
      items,
      page: pageNumber,
      pageSize,
      totalCount,
    });
  }
}