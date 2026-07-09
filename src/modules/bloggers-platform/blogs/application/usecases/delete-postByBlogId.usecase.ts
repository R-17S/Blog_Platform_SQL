import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class DeletePostByBlogIdCommand {
  constructor(
    public readonly blogId: string,
    public readonly postId: string,
  ) {}
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase
  implements ICommandHandler<DeletePostByBlogIdCommand, void>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute({ blogId, postId }: DeletePostByBlogIdCommand): Promise<void> {
    await this.blogsRepository.checkBlogExistsOrError(blogId);
    const post = await this.postsRepository.findById(postId);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    if (post.blogId !== blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found for this blog',
      });
    }
    await this.postsRepository.softDelete(postId);
  }
}
