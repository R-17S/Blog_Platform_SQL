import { Module } from '@nestjs/common';
import { Pool } from 'pg';

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL_NEON,
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
export class PgModule {}
