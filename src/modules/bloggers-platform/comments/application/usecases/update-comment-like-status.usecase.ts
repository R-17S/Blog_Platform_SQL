import { LikeStatusTypes } from '../../api/view-dto/comments.view-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    private readonly commentLikesRepository: CommentLikesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute({
    commentId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateCommentLikeStatusCommand): Promise<void> {
    // 1. Проверяем, что комментарий существует
    await this.commentsRepository.checkCommentExistsOrError(commentId);

    // 2. Ищем существующий лайк
    const existing = await this.commentLikesRepository.findByCommentAndUser(
      commentId,
      userId,
    );

    // 3. Если статус None → удаляем лайк
    if (likeStatus === LikeStatusTypes.None) {
      if (existing) {
        await this.commentLikesRepository.deleteLike(commentId, userId);
      }
      return;
    }

    const now = new Date().toISOString();

    // 4. Если лайк существует → обновляем
    if (existing) {
      await this.commentLikesRepository.updateLike({
        commentId,
        userId,
        userLogin: existing.userLogin,
        status: likeStatus,
        createdAt: now, // время последнего действия
      });
      return;
    }

    // 5. Если лайка нет → создаём
    await this.commentLikesRepository.createLike({
      commentId,
      userId,
      userLogin,
      status: likeStatus,
      createdAt: now,
    });
  }
}
