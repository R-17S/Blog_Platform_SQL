import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class TestingService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async clearDatabase(): Promise<void> {
    // CASCADE автоматически разруливает все внешние ключи.
    await this.pool.query(`
      TRUNCATE TABLE 
        "CommentLikes", 
        "PostLikes", 
        "Comments", 
        "Posts", 
        "SecurityDevices", 
        "Users", 
        "Blogs" 
      RESTART IDENTITY CASCADE;
    `);
  }
}
