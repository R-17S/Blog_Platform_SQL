import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { Comment } from '../../domain/comment.entity';
import type { CommentModelType } from '../../domain/comment.entity';
import { CreateCommentDto } from '../../dto/create-comment.dto';

export class CreateCommentCommand {
  constructor(
    public readonly input: CreateCommentDto,
    public readonly postId: string,
    public readonly userId: string,
    public readonly userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand, string>
{
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: CommentModelType,
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute({
    input,
    postId,
    userId,
    userLogin,
  }: CreateCommentCommand): Promise<string> {
    await this.postsRepository.checkPostExistsOrError(postId);

    const comment = this.commentModel.createInstance(
      input.content,
      postId,
      userId,
      userLogin,
    );
    await this.commentsRepository.save(comment);
    return comment._id.toString();
  }
}
