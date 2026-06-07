import { InjectModel } from '@nestjs/mongoose';
import { PostLike, PostLikeDocument } from '../domain/post.like-scheme';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostLikesRepository {
  constructor(
    @InjectModel(PostLike.name)
    private readonly postLikeModel: Model<PostLikeDocument>,
  ) {}

  async save(postLike: PostLikeDocument): Promise<void> {
    await postLike.save();
  }

  async findByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.postLikeModel.findOne({ postId, userId });
  }

  async delete(like: PostLikeDocument): Promise<void> {
    await like.deleteOne();
  }
}
