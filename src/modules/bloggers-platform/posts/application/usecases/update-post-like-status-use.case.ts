import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostLike } from '../../domain/post.like-scheme';
import type { PostLikeModelType } from '../../domain/post.like-scheme';
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
    @InjectModel(PostLike.name)
    private readonly likeModel: PostLikeModelType,
    private readonly postsRepository: PostsRepository,
    private readonly postLikesRepository: PostLikesRepository,
  ) {}
  async execute({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdatePostLikeStatusCommand): Promise<void> {
    await this.postsRepository.checkPostExistsOrError(postId);

    const existing = await this.postLikesRepository.findByPostAndUser(
      postId,
      userId,
    );

    if (likeStatus === LikeStatusTypes.None) {
      if (existing) await this.postLikesRepository.delete(existing);
      return;
    }
    if (existing) {
      existing.updateDetails(likeStatus);
      await this.postLikesRepository.save(existing);
    } else {
      const like = this.likeModel.createInstance(
        postId,
        userId,
        userLogin,
        likeStatus,
      );
      await this.postLikesRepository.save(like);
    }
  }
}
