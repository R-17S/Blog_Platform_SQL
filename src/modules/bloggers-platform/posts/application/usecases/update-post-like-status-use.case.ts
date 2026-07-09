import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikeSqlEntity } from '../../domain/post.like-scheme';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLikesRepository } from '../../infrastructure/post-likes.repository';
import { LikeStatusTypes } from '../../api/view-dto/posts.view-dto';

export class UpdatePostLikeStatusCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: string,
    public readonly userLogin: string,
    public readonly likeStatus: LikeStatusTypes,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand, void>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}
  async execute({
    postId,
    userId,
    likeStatus,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    await this.postsRepository.checkPostExistsOrError(postId);

    const existing = await this.postLikesRepository.findByPostAndUser(
      postId,
      userId,
    );

    if (likeStatus === LikeStatusTypes.None) {
      if (existing) await this.postLikesRepository.deleteLike(postId, userId);
      return;
    }
    if (existing) {
      await this.postLikesRepository.updateLike({
        userId,
        postId,
        status: likeStatus,
        createdAt: new Date().toISOString(),
      });
      return;
    } else {
      const newLike: PostLikeSqlEntity = {
        postId,
        userId,
        status: likeStatus,
        createdAt: new Date().toISOString(),
      };
      await this.postLikesRepository.createLike(newLike);
    }
  }
}
