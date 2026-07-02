import { CommentsController } from './api/comments.controller';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentLikesQueryRepository } from './infrastructure/query/comments.likes.query-repository';

@Module({
  imports: [
    forwardRef(() => PostsModule), // ← нужен для проверки существования поста
  ],
  controllers: [CommentsController],
  providers: [
    CommentsRepository,
    CommentsQueryRepository,
    //CommentsService,
    CommentLikesQueryRepository,
  ],
  exports: [CommentsQueryRepository, CommentsRepository],
})
export class CommentsModule {}
