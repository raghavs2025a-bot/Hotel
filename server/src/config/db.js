import mysql from 'mysql2/promise';
import { config } from './env.js';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: true,
  decimalNumbers: true,
});

const clean = (params) => params.map((p) => (p === undefined ? null : p));

/** Run a parameterized statement on the pool. SELECT -> rows, INSERT/UPDATE -> ResultSetHeader */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, clean(params));
  return rows;
}

/** Run a parameterized statement on a transaction connection. */
export async function q(conn, sql, params = []) {
  const [rows] = await conn.execute(sql, clean(params));
  return rows;
}

export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}
