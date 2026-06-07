import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostInputQuery } from '../../api/input-dto/get-posts-query-params.input-dto';
import {
  PostsViewPaginated,
  PostViewModel,
} from '../../api/view-dto/posts.view-dto';
import { Post, PostDocument } from '../../domain/post.entity';
import { PostLikesQueryRepository } from './posts.likes.query-repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    private readonly postLikesRepository: PostLikesQueryRepository,
  ) {}

  async getAllPosts(
    params: PostInputQuery,
    userId?: string,
  ): Promise<PostsViewPaginated> {
    const filter = { deletedAt: null };
    const [totalCount, posts] = await Promise.all([
      this.postModel.countDocuments(filter),
      this.postModel
        .find(filter)
        .sort(params.SortOptions(params.sortBy))
        .skip(params.calculateSkip())
        .limit(params.pageSize)
        .lean(),
    ]);

    const items = await this.postLikesRepository.enrichPostsWithLikes(
      posts,
      userId,
    );

    return PostsViewPaginated.mapToView({
      items,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }

  async getPostByIdOrError(
    id: string,
    userId?: string,
  ): Promise<PostViewModel> {
    if (!Types.ObjectId.isValid(id)) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    const result = await this.postModel
      .findOne({ _id: id, deletedAt: null }) // фильтруем только "живые" посты
      .lean();
    if (!result)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });

    const items = await this.postLikesRepository.enrichPostsWithLikes(
      [result],
      userId,
    );
    return items[0];
  }

  async getPostsByBlogId(
    id: string,
    params: PostInputQuery,
    userId?: string,
  ): Promise<PostsViewPaginated> {
    const filter = { blogId: id, deletedAt: null };

    const [totalCount, posts] = await Promise.all([
      this.postModel.countDocuments(filter),
      this.postModel
        .find(filter)
        .sort(params.SortOptions(params.sortBy))
        .skip(params.calculateSkip())
        .limit(params.pageSize)
        .lean(),
    ]);

    const items = await this.postLikesRepository.enrichPostsWithLikes(
      posts,
      userId,
    );

    return PostsViewPaginated.mapToView({
      items,
      page: params.pageNumber,
      pageSize: params.pageSize,
      totalCount,
    });
  }
}
