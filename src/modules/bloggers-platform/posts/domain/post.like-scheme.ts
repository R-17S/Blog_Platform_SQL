import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatusTypes } from '../api/view-dto/posts.view-dto';

// enum MyLikeStatusTypes {
//   Like = 'Like',
//   Dislike = 'Dislike',
// }

@Schema()
export class PostLike {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userLogin: string;

  @Prop({ required: true, enum: LikeStatusTypes })
  status: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  static createInstance(
    postId: string,
    userId: string,
    userLogin: string,
    status: LikeStatusTypes,
  ): PostLikeDocument {
    const like = new this();
    like.postId = postId;
    like.userId = userId;
    like.userLogin = userLogin;
    like.status = status;
    like.createdAt = new Date();
    return like as PostLikeDocument;
  }

  updateDetails(status: LikeStatusTypes) {
    this.status = status;
    this.createdAt = new Date();
  }
}

export const PostLikeEntity = SchemaFactory.createForClass(PostLike);
PostLikeEntity.loadClass(PostLike);

export type PostLikeDocument = HydratedDocument<PostLike>;
export type PostLikeModelType = Model<PostLikeDocument> & typeof PostLike;
