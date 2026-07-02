import { CreateBlogDto } from '../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogSqlEntity } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class CreateBlogCommand {
  constructor(public readonly input: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, string>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute({ input }: CreateBlogCommand): Promise<string> {
    const blog: BlogSqlEntity = {
      id: crypto.randomUUID(),
      name: input.name,
      description: input.description,
      websiteUrl: input.websiteUrl,
      isMembership: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    await this.blogsRepository.createBlog(blog);
    return blog.id;
  }
}
