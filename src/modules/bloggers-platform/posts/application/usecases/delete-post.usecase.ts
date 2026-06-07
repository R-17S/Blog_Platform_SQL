import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand, void>
{
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    private readonly postsRepository: PostsRepository,
  ) {}
  async execute({ id }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findById(id);
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
