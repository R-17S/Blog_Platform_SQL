import { LikeStatusTypes } from '../../api/view-dto/comments.view-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLike } from '../../domain/comment.like-scheme';
import type { CommentLikeModelType } from '../../domain/comment.like-scheme';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { CommentLikesRepository } from '../../infrastructure/comment-likes.repository';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly likeStatus: LikeStatusTypes,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand, void>
{
  constructor(
    @InjectModel(CommentLike.name)
    private readonly likeModel: CommentLikeModelType,
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentRepository: CommentsRepository,
  ) {}
  async execute({
    commentId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateCommentLikeStatusCommand): Promise<void> {
    await this.commentRepository.checkCommentExistsOrError(commentId);

    const existing = await this.commentLikesRepository.findByCommentAndUser(
      commentId,
      userId,
    );

    if (likeStatus === LikeStatusTypes.None) {
      if (existing) await this.commentLikesRepository.delete(existing);
      return;
    }
    if (existing) {
      existing.updateDetails(likeStatus);
      await this.commentLikesRepository.save(existing);
    } else {
      const like = this.likeModel.createInstance(
        commentId,
        userId,
        userLogin,
        likeStatus,
      );
      await this.commentLikesRepository.save(like);
    }
  }
}
