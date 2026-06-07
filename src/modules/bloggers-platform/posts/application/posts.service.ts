import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { BlogsService } from '../../blogs/application/blogs.service';
import { PostsRepository } from '../infrastructure/posts.repository';
import type { PostModelType } from '../domain/post.entity';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly blogsRepository: BlogsRepository,
    private readonly blogsService: BlogsService,
    @InjectModel('Post') private readonly postModel: PostModelType,
  ) {}

  async createPost(input: CreatePostDto, blogId?: string): Promise<string> {
    const effectiveBlogId = blogId ?? input.blogId;
    if (!effectiveBlogId) throw new NotFoundException('Blog ID is required');

    const blogName =
      await this.blogsRepository.getBlogNameOrError(effectiveBlogId);

    const post = this.postModel.createInstance(
      input.title,
      input.shortDescription,
      input.content,
      effectiveBlogId,
      blogName,
    );

    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async updatePost(id: string, input: UpdatePostDto): Promise<void> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    await this.blogsRepository.checkBlogExistsOrError(input.blogId);

    post.updateDetails(input.title, input.shortDescription, input.content);
    await this.postsRepository.save(post);
  }

  async deletePost(id: string): Promise<void> {
    const post = await this.postsRepository.findById(id);
    if (!post) throw new NotFoundException('Post not found');

    // мягкое удаление
    post.makeDeleted();
    await this.postsRepository.save(post);
  }

  // async checkPostExistsOrError(id: string): Promise<void> {
  //   const exists = await this.postsRepository.exists(id);
  //   if (!exists) throw new NotFoundException('Post not found');
  // }
}
