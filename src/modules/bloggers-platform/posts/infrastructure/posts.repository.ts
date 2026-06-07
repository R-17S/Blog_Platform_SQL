import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async save(post: PostDocument): Promise<void> {
    await post.save();
  }

  async findById(id: string): Promise<PostDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.postModel.findOne({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });
  }

  async checkPostExistsOrError(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const exists = await this.postModel.exists({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });

    if (!exists)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
  }

  async deleteAll(): Promise<void> {
    await this.postModel.deleteMany({});
  }

  async findByBlogId(blogId: string): Promise<PostDocument[]> {
    return this.postModel.find({ blogId }).exec();
  }
}
