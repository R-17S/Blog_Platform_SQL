import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommentSqlEntity } from '../../domain/comment.entity';

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
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute({
    input,
    postId,
    userId,
    userLogin,
  }: CreateCommentCommand): Promise<string> {
    // 1. Проверяем, что пост существует
    await this.postsRepository.checkPostExistsOrError(postId);

    // 2. Создаём SQL‑сущность комментария
    const now = new Date().toISOString();
    const comment: CommentSqlEntity = {
      id: crypto.randomUUID(),
      postId,
      content: input.content,
      userId,
      userLogin,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // 3. Сохраняем
    await this.commentsRepository.createComment(comment);

    // 4. Возвращаем id
    return comment.id;
  }
}
