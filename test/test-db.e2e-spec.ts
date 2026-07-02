import { Pool } from 'pg';
import 'dotenv/config';

describe('Database Connection', () => {
  it('should successfully connect to PostgreSQL', async () => {
    const pool = new Pool({
      connectionString: 'postgres://postgres:12345@localhost:5432/BlogPlatform',
    });

    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Успешное подключение! Текущее время:', result.rows[0]);
      expect(result.rows[0]).toBeDefined(); // Утверждение Jest
    } finally {
      await pool.end();
    }
  });
});
