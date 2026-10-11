import { query } from '../config/db.js';

const PUBLIC = 'id, name, email, phone, address, role, is_active, created_at';

export const findByEmail = async (email) => (await query('SELECT * FROM users WHERE email = ?', [email]))[0] || null;
export const findById = async (id) => (await query(`SELECT ${PUBLIC} FROM users WHERE id = ?`, [id]))[0] || null;
export const findWithHash = async (id) => (await query('SELECT * FROM users WHERE id = ?', [id]))[0] || null;

export async function createUser({ name, email, phone, passwordHash, role = 'customer' }) {
  const res = await query('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', [name, email, phone, passwordHash, role]);
  return findById(res.insertId);
}

export async function updateProfile(id, { name, phone, address }) {
  await query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?', [name, phone, address || null, id]);
  return findById(id);
}

export const updatePassword = (id, hash) => query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
export const setActive = (id, active) => query('UPDATE users SET is_active = ? WHERE id = ?', [active ? 1 : 0, id]);

export async function listCustomers({ search, status }) {
  const where = ["u.role = 'customer'"];
  const params = [];
  if (search) {
    where.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (status === 'active') where.push('u.is_active = 1');
  if (status === 'inactive') where.push('u.is_active = 0');
  return query(
    `SELECT u.id, u.name, u.email, u.phone, u.address, u.is_active, u.created_at,
            COUNT(b.id) AS bookings_count,
            COALESCE(SUM(CASE WHEN b.status <> 'cancelled' THEN b.total_amount ELSE 0 END), 0) AS total_spent
     FROM users u LEFT JOIN bookings b ON b.user_id = u.id
     WHERE ${where.join(' AND ')}
     GROUP BY u.id ORDER BY u.created_at DESC`,
    params
  );
}
