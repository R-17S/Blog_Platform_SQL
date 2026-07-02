import { PostsController } from './api/posts.controller';
import { PostsRepository } from './infrastructure/posts.repository';
import { PostsQueryRepository } from './infrastructure/query/posts.query-repository';
import { forwardRef, Module } from '@nestjs/common';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';
import { PostLikesQueryRepository } from './infrastructure/query/posts.likes.query-repository';
import { PostLikesRepository } from './infrastructure/post-likes.repository';

@Module({
  imports: [forwardRef(() => BlogsModule), forwardRef(() => CommentsModule)],
  controllers: [PostsController],
  providers: [
    // SQL repositories
    PostsRepository,
    PostLikesRepository,

    // SQL query repositories
    PostsQueryRepository,
    PostLikesQueryRepository,
  ],
  exports: [
    PostsRepository,
    PostsQueryRepository,
    PostLikesRepository,
    PostLikesQueryRepository,
  ],
})
export class PostsModule {}
