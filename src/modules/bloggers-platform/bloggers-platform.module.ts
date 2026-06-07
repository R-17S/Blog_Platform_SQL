import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogEntity } from './blogs/domain/blog.entity';
import { Post, PostEntity } from './posts/domain/post.entity';
import { PostLike, PostLikeEntity } from './posts/domain/post.like-scheme';
import { Comment, CommentEntity } from './comments/domain/comment.entity';
import {
  CommentLike,
  CommentLikeEntity,
} from './comments/domain/comment.like-scheme';
import { BlogsController } from './blogs/api/blogs.controller';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostLikesQueryRepository } from './posts/infrastructure/query/posts.likes.query-repository';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { CommentLikesQueryRepository } from './comments/infrastructure/query/comments.likes.query-repository';
import { Module } from '@nestjs/common';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdatePostLikeStatusUseCase } from './posts/application/usecases/update-post-like-status-use.case';
import { UpdateCommentLikeStatusUseCase } from './comments/application/usecases/update-comment-like-status.usecase';
import { PostLikesRepository } from './posts/infrastructure/post-likes.repository';
import { CommentLikesRepository } from './comments/infrastructure/comment-likes.repository';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogEntity },
      { name: Post.name, schema: PostEntity },
      { name: PostLike.name, schema: PostLikeEntity },
      { name: Comment.name, schema: CommentEntity },
      { name: CommentLike.name, schema: CommentLikeEntity },
    ]),
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    // Blogs
    BlogsRepository,
    BlogsQueryRepository,
    //BlogsService,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,

    // Posts
    PostsRepository,
    PostsQueryRepository,
    //PostsService,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    UpdatePostLikeStatusUseCase,
    PostLikesQueryRepository,
    PostLikesRepository,

    // Comments
    CommentsRepository,
    CommentsQueryRepository,
    CreateCommentUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    UpdateCommentLikeStatusUseCase,
    CommentLikesQueryRepository,
    CommentLikesRepository,
  ],
  exports: [
    BlogsRepository,
    //BlogsService,
    PostsRepository,
    //PostsService,
    CommentsRepository,
    CommentsQueryRepository,
  ],
})
export class BloggersPlatformModule {}
