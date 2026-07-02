import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { UpdateCommentDto } from '../../dto/update-comment.dto';
import { CommentSqlEntity } from '../../domain/comment.entity';

export class UpdateCommentCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateCommentDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand, void>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ id, input, userId }: UpdateCommentCommand): Promise<void> {
    // 1. Ищем комментарий
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    // 2. Проверяем владельца
    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You cannot edit this comment',
      });
    }

    // 3. Обновляем данные
    const updated: CommentSqlEntity = {
      ...comment,
      content: input.content,
      updatedAt: new Date().toISOString(),
    };

    // 4. Сохраняем
    await this.commentsRepository.updateComment(updated);
  }
}
