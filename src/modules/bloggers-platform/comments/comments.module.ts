import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentEntity } from './domain/comment.entity';
import { CommentsController } from './api/comments.controller';
import { CommentsQueryRepository } from './infrastructure/query/comments.query-repository';
import { forwardRef, Module } from '@nestjs/common';
import { PostsModule } from '../posts/posts.module';
import { CommentsRepository } from './infrastructure/comments.repository';
import { CommentLikesQueryRepository } from './infrastructure/query/comments.likes.query-repository';
import { CommentLike, CommentLikeEntity } from './domain/comment.like-scheme';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentEntity },
      { name: CommentLike.name, schema: CommentLikeEntity },
    ]),
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
