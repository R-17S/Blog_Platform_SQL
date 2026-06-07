import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostEntity } from './domain/post.entity';
import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { PostsService } from './application/posts.service';
import { forwardRef, Module } from '@nestjs/common';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { PostLike, PostLikeEntity } from './domain/post.like-scheme';
import { PostLikesQueryRepository } from './infrastructure/query/posts.likes.query-repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostEntity },
      { name: PostLike.name, schema: PostLikeEntity },
    ]),
    forwardRef(() => BlogsModule),
    forwardRef(() => CommentsModule),
  ],
  controllers: [PostsController],
  providers: [
    PostsRepository,
    PostsQueryRepository,
    PostsService,
    PostLikesQueryRepository,
  ],
  exports: [
    PostsRepository,
    PostsService,
    PostLikesQueryRepository,
    PostsQueryRepository,
  ],
})
export class PostsModule {}
