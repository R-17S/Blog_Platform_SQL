import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteCommentCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand, void> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute({ id, userId }: DeleteCommentCommand): Promise<void> {
    // 1. Так тут нашли коммент
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    // 2. Проверяем
    if (comment.userId !== userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You cannot edit this comment',
      });
    }

    // 3. Удаление через софт или на комменты оставить полное?
    await this.commentsRepository.softDelete(id);
  }
}
