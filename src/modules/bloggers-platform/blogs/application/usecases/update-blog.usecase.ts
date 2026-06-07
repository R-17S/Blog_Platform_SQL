import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../domain/blog.entity';
import type { BlogModelType } from '../../domain/blog.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand, void>
{
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
    private readonly blogsRepository: BlogsRepository,
  ) {}
  async execute({ id, input }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findById(id);
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });

    blog.updateDetails(input.name, input.description, input.websiteUrl);
    await this.blogsRepository.save(blog);
  }
}
