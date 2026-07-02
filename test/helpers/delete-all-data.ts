import { INestApplication } from '@nestjs/common';
import { Pool } from 'pg';

export const deleteAllData = async (app: INestApplication): Promise<void> => {
  const pool = app.get<Pool>('PG_POOL');

  await pool.query(`
    TRUNCATE 
      "SecurityDevices", 
      "Users"
    RESTART IDENTITY CASCADE;
  `);
};

// export const deleteAllData = async (app: INestApplication): Promise<void> => {
//   await request(app.getHttpServer())
//     .delete(`/api/testing/all-data`)
//     .expect(204);
// };
