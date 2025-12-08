import mysql, { type RowDataPacket, type OkPacket } from 'mysql2/promise';

export type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
};

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error('Missing database configuration in environment variables.');
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function getConnection() {
  return pool.getConnection();
}

export async function query<
  T extends RowDataPacket[] | RowDataPacket[][] | OkPacket | OkPacket[]
>(sql: string, params: any[] = []) {
  const [rows] = await pool.query<T>(sql, params);
  return rows;
}

export async function closePool() {
  await pool.end();
}

export async function findUserByEmail(email: string) {
  const rows = await query<UserRow[]>(
    'SELECT * FROM users WHERE email = ? AND (deleteAt IS NULL)',
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id: number) {
  const rows = await query<UserRow[]>(
    'SELECT * FROM users WHERE id = ? AND (deleteAt IS NULL)',
    [id]
  );
  return rows[0] ?? null;
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const { name, email, password, role = 'user' } = params;
  const result = await query<OkPacket>(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
}

export async function listActiveUsers() {
  return query<UserRow[]>('SELECT * FROM users WHERE deleteAt IS NULL ORDER BY createdAt DESC');
}

export async function listActiveUsersExcluding(excludeUserId: number) {
  return query<UserRow[]>(
    'SELECT * FROM users WHERE deleteAt IS NULL AND id <> ? ORDER BY createdAt DESC',
    [excludeUserId]
  );
}

export async function updateUser(
  id: number,
  fields: { name?: string; email?: string; password?: string; role?: string }
) {
  const updates: string[] = [];
  const params: any[] = [];

  if (fields.name) {
    updates.push('name = ?');
    params.push(fields.name);
  }
  if (fields.email) {
    updates.push('email = ?');
    params.push(fields.email);
  }
  if (fields.password) {
    updates.push('password = ?');
    params.push(fields.password);
  }
  if (fields.role) {
    updates.push('role = ?');
    params.push(fields.role);
  }

  if (!updates.length) return false;

  params.push(id);
  const result = await query<OkPacket>(
    `UPDATE users SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deleteAt IS NULL`,
    params
  );
  return result.affectedRows > 0;
}

export async function softDeleteUser(id: number) {
  const result = await query<OkPacket>(
    'UPDATE users SET deleteAt = CURRENT_TIMESTAMP WHERE id = ? AND deleteAt IS NULL',
    [id]
  );
  return result.affectedRows > 0;
}

