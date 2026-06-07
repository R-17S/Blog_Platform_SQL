import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand, void>
{
  constructor(
    @InjectModel(Post.name) private readonly postModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute({ id, input }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findById(id);
    if (!post)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });

    await this.blogsRepository.checkBlogExistsOrError(input.blogId);
    post.updateDetails(input.title, input.shortDescription, input.content);
    await this.postsRepository.save(post);
  }
}
