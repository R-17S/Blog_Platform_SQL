import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusTypes } from '../../posts/api/view-dto/posts.view-dto';

export enum MyLikeStatusTypes {
  Like = 'Like',
  Dislike = 'Dislike',
}

@Schema()
export class CommentLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true, enum: LikeStatusTypes })
  status: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  static createInstance(
    commentId: string,
    userId: string,
    userLogin: string,
    status: LikeStatusTypes,
  ): CommentLikeDocument {
    const like = new this();
    like.commentId = commentId;
    like.userId = userId;
    like.userLogin = userLogin;
    like.status = status;
    like.createdAt = new Date();
    return like as CommentLikeDocument;
  }

  updateDetails(status: LikeStatusTypes) {
    this.status = status;
    this.createdAt = new Date();
  }
}

export const CommentLikeEntity = SchemaFactory.createForClass(CommentLike);
CommentLikeEntity.loadClass(CommentLike);

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export type CommentLikeModelType = Model<CommentLikeDocument> &
  typeof CommentLike;
