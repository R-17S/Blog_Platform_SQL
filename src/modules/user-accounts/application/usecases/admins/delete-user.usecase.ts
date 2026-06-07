import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const exists = await this.usersRepository.exists(userId);
    if (!exists)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    await this.usersRepository.delete(userId);
  }
}
