import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostSqlEntity } from '../../domain/post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

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
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    const { title, shortDescription, content, blogId } = command;

    // 1. Проверяем, что блог существует и получаем blogName
    const blogName = await this.blogsRepository.getBlogNameOrError(blogId);

    // 2. Создаём SQL‑сущность (плоский объект)
    const now = new Date().toISOString();
    const post: PostSqlEntity = {
      id: crypto.randomUUID(),
      title,
      shortDescription,
      content,
      blogId,
      blogName,
      likesCount: 0,
      dislikesCount: 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    // 3. Сохраняем в базе
    await this.postsRepository.createPost(post);

    // 4. Возвращаем id
    return post.id;
  }
}
