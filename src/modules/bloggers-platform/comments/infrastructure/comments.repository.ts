import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async save(comment: CommentDocument): Promise<void> {
    await comment.save();
  }

  async findById(id: string): Promise<CommentDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.commentModel.findOne({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });
  }

  async checkCommentExistsOrError(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    const exists = await this.commentModel.exists({
      _id: new Types.ObjectId(id),
      deletedAt: null,
    });

    if (!exists)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
  }

  async deleteAll(): Promise<void> {
    await this.commentModel.deleteMany({});
  }
}
