import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../domain/comment.like-scheme';
import { Model, Types } from 'mongoose';

@Injectable()
export class CommentLikesRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private readonly commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async save(commentLike: CommentLikeDocument): Promise<void> {
    await commentLike.save();
  }

  async findByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<CommentLikeDocument | null> {
    if (!Types.ObjectId.isValid(commentId)) return null;
    return this.commentLikeModel.findOne({ commentId, userId });
  }

  async delete(like: CommentLikeDocument): Promise<void> {
    await like.deleteOne({});
  }
}
