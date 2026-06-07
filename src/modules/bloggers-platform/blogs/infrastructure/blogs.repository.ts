import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}

  async save(blog: BlogDocument): Promise<void> {
    await blog.save();
  }

  async findById(id: string): Promise<BlogDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.blogModel.findOne({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });
  }

  async getBlogNameOrError(id: string): Promise<string> {
    const blog = await this.blogModel
      .findById(id, { name: 1 })
      .lean<{ name: string }>();
    if (!blog)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    return blog.name;
  }

  async checkBlogExistsOrError(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    const exists = await this.blogModel.exists({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });
    if (!exists)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
  }

  async deleteAll(): Promise<void> {
    await this.blogModel.deleteMany({});
  }
}
