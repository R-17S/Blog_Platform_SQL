import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CommentsViewPaginated,
  CommentViewModel,
  LikeStatusTypes,
} from '../../api/view-dto/comments.view-dto';
import { Comment, CommentDocument } from '../../domain/comment.entity';
import { CommentLikesQueryRepository } from './comments.likes.query-repository';
import { CommentInputQuery } from '../../api/input-dto/get-comments-query-params.input-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
    private readonly commentLikesRepository: CommentLikesQueryRepository,
  ) {}

  // async getAllPosts(
  //   params: PostInputQuery,
  //   userId?: string,
  // ): Promise<PostsViewPaginated> {
  //   const [totalCount, posts] = await Promise.all([
  //     this.postModel.countDocuments({}),
  //     this.postModel
  //       .find({})
  //       .sort(params.SortOptions(params.sortBy))
  //       .skip(params.calculateSkip())
  //       .limit(params.pageSize)
  //       .lean(),
  //   ]);
  //
  //   const items = await this.postLikesRepository.enrichPostsWithLikes(
  //     posts,
  //     userId,
  //   );
  //
  //   return PostsViewPaginated.mapToView({
  //     items,
  //     page: params.pageNumber,
  //     size: params.pageSize,
  //     totalCount,
  //   });
  // }

  async getCommentByIdOrError(
    id: string,
    userId?: string,
  ): Promise<CommentViewModel> {
    const result = await this.commentModel
      .findOne({ _id: id, deletedAt: null }) // фильтруем только "живые" комменты
      .lean();
    if (!result)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    const commentId = result._id.toString();
    const [likesMap, dislikesMap] = await Promise.all([
      this.commentLikesRepository.getLikesCountForComments([commentId]),
      this.commentLikesRepository.getDislikesCountForComments([commentId]),
    ]);
    const statusesMap = userId
      ? await this.commentLikesRepository.getStatusesForComments(userId, [id])
      : {};

    const myStatus = statusesMap[id] ?? LikeStatusTypes.None;
    const likesCount = likesMap[commentId] ?? 0;
    const dislikesCount = dislikesMap[commentId] ?? 0;

    return CommentViewModel.mapToView(
      result,
      myStatus,
      likesCount,
      dislikesCount,
    );
  }

  async getCommentsByPostId(
    id: string,
    params: CommentInputQuery,
    userId?: string,
  ): Promise<CommentsViewPaginated> {
    const filter = { postId: id, deletedAt: null };

    const [totalCount, comments] = await Promise.all([
      this.commentModel.countDocuments(filter),
      this.commentModel
        .find(filter)
        .sort(params.SortOptions(params.sortBy))
        .skip(params.calculateSkip())
        .limit(params.pageSize)
        .lean(),
    ]);

    const commentIds = comments.map((comment) => comment._id.toString());
    const [likesMap, dislikesMap] = await Promise.all([
      this.commentLikesRepository.getLikesCountForComments(commentIds),
      this.commentLikesRepository.getDislikesCountForComments(commentIds),
    ]);
    const statusesMap = userId
      ? await this.commentLikesRepository.getStatusesForComments(
          userId,
          commentIds,
        )
      : {};

    const items = comments.map((comment) =>
      CommentViewModel.mapToView(
        comment,
        statusesMap[comment._id.toString()] ?? LikeStatusTypes.None,
        likesMap[comment._id.toString()] ?? 0,
        dislikesMap[comment._id.toString()] ?? 0,
      ),
    );

    return CommentsViewPaginated.mapToView({
      items,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }
}
