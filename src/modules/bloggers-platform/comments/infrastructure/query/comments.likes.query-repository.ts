import {
  CommentLike,
  CommentLikeDocument,
} from '../../domain/comment.like-scheme';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { LikeStatusTypes } from '../../api/view-dto/comments.view-dto';

@Injectable()
export class CommentLikesQueryRepository {
  constructor(
    @InjectModel(CommentLike.name)
    private readonly likeModel: Model<CommentLikeDocument>,
  ) {}

  async getStatusesForComments(
    userId: string,
    commentIds: string[],
  ): Promise<Record<string, LikeStatusTypes>> {
    const likes = await this.likeModel
      .find({ userId, commentId: { $in: commentIds } })
      .lean();

    const map: Record<string, LikeStatusTypes> = {};
    for (const like of likes) {
      map[like.commentId] = like.status as LikeStatusTypes;
    }
    return map;
  }

  async getLikesCountForComments(
    commentIds: string[],
  ): Promise<Record<string, number>> {
    const likes = await this.likeModel.aggregate<{
      _id: string;
      count: number;
    }>([
      {
        $match: {
          commentId: { $in: commentIds },
          status: LikeStatusTypes.Like,
        },
      },
      { $group: { _id: '$commentId', count: { $sum: 1 } } },
    ]);
    const map: Record<string, number> = {};
    for (const like of likes) {
      map[like._id] = like.count;
    }
    return map;
  }
  async getDislikesCountForComments(
    commentIds: string[],
  ): Promise<Record<string, number>> {
    const dislikes = await this.likeModel.aggregate<{
      _id: string;
      count: number;
    }>([
      {
        $match: {
          commentId: { $in: commentIds },
          status: LikeStatusTypes.Dislike,
        },
      },
      { $group: { _id: '$commentId', count: { $sum: 1 } } },
    ]);
    const map: Record<string, number> = {};
    for (const dislike of dislikes) {
      map[dislike._id] = dislike.count;
    }
    return map;
  }

  // async getNewestLikesForPosts(
  //   postIds: string[],
  // ): Promise<Record<string, NewestLikeViewModel[]>> {
  //   const likes = await this.likeModel.aggregate<AggregatedLikesResult>([
  //     { $match: { postId: { $in: postIds } } },
  //     { $sort: { createdAt: -1 } },
  //     { $group: { _id: '$postId', newest: { $push: '$$ROOT' } } }, // создаёт массив newest, куда складываются все документы этой группы. добавляет элемент в массив.$$ROOT — это специальная переменная, которая означает «весь текущий документ целиком»
  //   ]);
  //   const map: Record<string, NewestLikeViewModel[]> = {};
  //   for (const like of likes) {
  //     map[like._id] = like.newest.slice(0, 3).map((x) => ({
  //       userId: x.userId,
  //       login: x.login,
  //       addedAt: x.createdAt,
  //     }));
  //   }
  //   return map;
  // }

  // async enrichPostsWithLikes(
  //   posts: PostDocument[],
  //   userId?: string,
  // ): Promise<PostViewModel[]> {
  //   const postIds = posts.map((p) => p._id.toString());
  //
  //   const [statusesMap, newestLikesMap] = await Promise.all([
  //     userId ? this.getStatusesForPosts(userId, postIds) : {},
  //     this.getNewestLikesForPosts(postIds),
  //   ]);
  //
  //   return posts.map((post) =>
  //     PostViewModel.mapToView(
  //       post,
  //       statusesMap[post._id.toString()] ?? LikeStatusTypes.None,
  //       newestLikesMap[post._id.toString()] ?? [],
  //     ),
  //   );
  // }
}
