import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Post } from '../../domain/post.entity';
import type { PostModelType } from '../../domain/post.entity';

export class CreatePostCommand {
  constructor(
    public readonly title: string,
    public readonly shortDescription: string,
    public readonly content: string,
    public readonly blogId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase
  implements ICommandHandler<CreatePostCommand, string>
{
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: PostModelType,
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(input: CreatePostCommand): Promise<string> {
    // Проверяем, что блог существует
    const blogName = await this.blogsRepository.getBlogNameOrError(
      input.blogId,
    );

    // Создаём доменную сущность
    const post = this.postModel.createInstance(
      input.title,
      input.shortDescription,
      input.content,
      input.blogId,
      blogName,
    );

    await this.postsRepository.save(post);

    return post._id.toString();
  }
}
