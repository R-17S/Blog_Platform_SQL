import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(private readonly postsRepository: PostsRepository) {}
  async execute({ id }: DeletePostCommand): Promise<void> {
    await this.postsRepository.checkPostExistsOrError(id);
    await this.postsRepository.softDelete(id);
  }
}
