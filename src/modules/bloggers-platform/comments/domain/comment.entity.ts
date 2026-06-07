import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({
    required: true,
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
  })
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };

  @Prop({ required: true })
  postId: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  // timestamps: true автоматически добавит createdAt и updatedAt
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  /**
   * Factory method to create a Comment instance
   */
  static createInstance(
    content: string,
    postId: string,
    userId: string,
    userLogin: string,
  ): CommentDocument {
    const comment = new this();
    comment.content = content;
    comment.commentatorInfo = { userId, userLogin };
    comment.postId = postId;
    comment.likesCount = 0;
    comment.dislikesCount = 0;
    return comment as CommentDocument;
  }

  /**
   * Updates comment content
   */
  updateContent(newContent: string) {
    this.content = newContent;
  }

  /**
   * Marks comment as deleted (soft delete)
   */
  makeDeleted() {
    this.deletedAt = new Date();
  }
}

export const CommentEntity = SchemaFactory.createForClass(Comment);
CommentEntity.loadClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
export type CommentModelType = Model<CommentDocument> & typeof Comment;
