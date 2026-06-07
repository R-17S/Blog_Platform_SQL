import { PostLike, PostLikeDocument } from '../../domain/post.like-scheme';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { NewestLikeViewModel } from '../../dto/newest-like-view-model';
import { AggregatedLikesResult } from '../interface/post-aggregated-likes-result';
import { PostDocument } from '../../domain/post.entity';
import {
  LikeStatusTypes,
  PostViewModel,
} from '../../api/view-dto/posts.view-dto';

@Injectable()
export class PostLikesQueryRepository {
  constructor(
    @InjectModel(PostLike.name)
    private readonly likeModel: Model<PostLikeDocument>,
  ) {}

  async getStatusesForPosts(
    userId: string,
    postIds: string[],
  ): Promise<Record<string, LikeStatusTypes>> {
    const likes = await this.likeModel
      .find({ userId, postId: { $in: postIds } })
      .lean();
    const map: Record<string, LikeStatusTypes> = {};
    for (const like of likes) {
      map[like.postId] = like.status as LikeStatusTypes; // Не знаю как обойтись без типа
    }
    return map;
  }

  async getNewestLikesForPosts(
    postIds: string[],
  ): Promise<Record<string, NewestLikeViewModel[]>> {
    const likes = await this.likeModel.aggregate<AggregatedLikesResult>([
      { $match: { postId: { $in: postIds }, status: LikeStatusTypes.Like } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$postId', newest: { $push: '$$ROOT' } } }, // создаёт массив newest, куда складываются все документы этой группы. добавляет элемент в массив.$$ROOT — это специальная переменная, которая означает «весь текущий документ целиком»
    ]);
    const map: Record<string, NewestLikeViewModel[]> = {};
    for (const like of likes) {
      map[like._id] = like.newest.slice(0, 3).map((x) => ({
        userId: x.userId,
        login: x.userLogin,
        addedAt: x.createdAt,
      }));
    }
    return map;
  }

  async getLikesCountForPosts(postIds: string[]) {
    const likes = await this.likeModel.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { postId: { $in: postIds }, status: LikeStatusTypes.Like } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const map: Record<string, number> = {};
    for (const like of likes) {
      map[like._id] = like.count;
    }
    return map;
  }

  async getDislikesCountForPosts(postIds: string[]) {
    const dislikes = await this.likeModel.aggregate<{
      _id: string;
      count: number;
    }>([
      { $match: { postId: { $in: postIds }, status: LikeStatusTypes.Dislike } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const map: Record<string, number> = {};
    for (const dislike of dislikes) {
      map[dislike._id] = dislike.count;
    }
    return map;
  }

  async enrichPostsWithLikes(
    posts: PostDocument[],
    userId?: string,
  ): Promise<PostViewModel[]> {
    const postIds = posts.map((p) => p._id.toString());

    const [statusesMap, newestLikesMap, likesCountMap, dislikesCountMap] =
      await Promise.all([
        userId ? this.getStatusesForPosts(userId, postIds) : {},
        this.getNewestLikesForPosts(postIds),
        this.getLikesCountForPosts(postIds),
        this.getDislikesCountForPosts(postIds),
      ]);

    return posts.map((post) =>
      PostViewModel.mapToView(
        post,
        statusesMap[post._id.toString()] ?? LikeStatusTypes.None,
        newestLikesMap[post._id.toString()] ?? [],
        likesCountMap[post._id.toString()] ?? 0,
        dislikesCountMap[post._id.toString()] ?? 0,
      ),
    );
  }
}
