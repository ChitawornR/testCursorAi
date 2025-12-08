import { NextResponse } from 'next/server';
import { createUser, listActiveUsersExcluding } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await listActiveUsersExcluding(session.id);
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const insertId = await createUser({
    name,
    email,
    password: hashed,
    role: role === 'admin' ? 'admin' : 'user',
  });

  const users = await listActiveUsersExcluding(session.id);
  const created = users.find((u) => u.id === insertId);

  return NextResponse.json(created ?? { id: insertId }, { status: 201 });
}

