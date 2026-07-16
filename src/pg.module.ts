import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useValue: pgPool,
    },
  ],
  exports: ['PG_POOL'],
})
export class PgModule implements OnModuleInit {
  // Внедряем наш пул подключений прямо в класс модуля
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  // Этот метод автоматически выполнится при старте приложения/тестов
  async onModuleInit() {
    try {
      // 1. Создаем представление для постов
      await this.pool.query(`
        CREATE OR REPLACE VIEW "v_posts_with_blog_name" AS
        SELECT 
            p."id",
            p."title",
            p."shortDescription",
            p."content",
            p."blogId",
            p."likesCount",
            p."dislikesCount",
            p."createdAt",
            p."updatedAt",
            p."deletedAt",
            b."name" AS "blogName"
        FROM "Posts" p
        INNER JOIN "Blogs" b ON p."blogId" = b."id";
      `);

      // 2. Создаем представление для комментариев
      await this.pool.query(`
        CREATE OR REPLACE VIEW "v_comments_with_user_login" AS
        SELECT 
            c."id",
            c."postId",
            c."content",
            c."userId",
            c."likesCount",
            c."dislikesCount",
            c."createdAt",
            c."updatedAt",
            c."deletedAt",
            u."login" AS "userLogin"
        FROM "Comments" c
        INNER JOIN "Users" u ON c."userId" = u."id";
      `);

      console.log('✅ SQL Views successfully synchronized');
    } catch (e) {
      console.error('❌ Failed to synchronize SQL Views on startup:', e);
    }
  }
}
