import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: 'postgres://postgres:12345@localhost:5432/BlogPlatform',
});

async function test() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Успешное подключение! Текущее время:', result.rows[0]);
  } catch (err) {
    console.error('Ошибка подключения:', err.message);
  } finally {
    await pool.end();
  }
}

test();
