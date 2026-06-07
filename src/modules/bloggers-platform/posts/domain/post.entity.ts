import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  static createInstance(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
  ): PostDocument {
    const post = new this();
    post.title = title;
    post.shortDescription = shortDescription;
    post.content = content;
    post.blogId = blogId;
    post.blogName = blogName;
    post.likesCount = 0;
    post.dislikesCount = 0;
    return post as PostDocument;
  }

  updateDetails(title: string, shortDescription: string, content: string) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      this.deletedAt = new Date();
    }
  }
}

export const PostEntity = SchemaFactory.createForClass(Post);
PostEntity.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;
export type PostModelType = Model<PostDocument> & typeof Post;
