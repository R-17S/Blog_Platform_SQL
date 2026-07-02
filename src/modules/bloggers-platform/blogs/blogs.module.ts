import { Module } from '@nestjs/common';

// import { BlogsRepository } from './infrastructure/blogs.repository';
// import { BlogsQueryRepository } from './infrastructure/query/blogs.query-repository';
import { BlogsController } from './api/blogs.controller';

@Module({
  // imports: [
  //   MongooseModule.forFeature([{ name: Blog.name, schema: BlogEntity }]),
  //   forwardRef(() => PostsModule),
  // ],
  controllers: [BlogsController],
  // providers: [BlogsRepository, BlogsQueryRepository, BlogsService],
  // exports: [BlogsRepository, BlogsService],
})
export class BlogsModule {}
