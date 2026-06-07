import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../domain/blog.entity';
import type { BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private readonly blogModel: BlogModelType,
  ) {}

  async createBlog(input: CreateBlogDto): Promise<string> {
    const blog = this.blogModel.createInstance(
      input.name,
      input.description,
      input.websiteUrl,
    );
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }

  async updateBlog(id: string, input: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');

    blog.updateDetails(input.name, input.description, input.websiteUrl);

    await this.blogsRepository.save(blog);
  }

  async deleteBlog(id: string): Promise<void> {
    const blog = await this.blogsRepository.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');

    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }

  // async checkBlogExistsOrError(id: string): Promise<void> {
  //   const exists = await this.blogsRepository.exists(id);
  //   if (!exists) throw new NotFoundException('Blog not found');
  // }
}
