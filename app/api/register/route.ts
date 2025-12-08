import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, findUserById } from '@/lib/db';
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from '@/lib/auth';

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const userId = await createUser({
    name,
    email,
    password: hashed,
    role: role === 'admin' ? 'admin' : 'user',
  });

  const createdUser = await findUserById(userId);
  if (!createdUser) {
    return NextResponse.json({ error: 'Failed to load new user' }, { status: 500 });
  }

  const token = await createSessionToken({
    id: createdUser.id,
    email: createdUser.email,
    name: createdUser.name,
    role: createdUser.role,
  });

  await setSessionCookie(token);

  return NextResponse.json(
    {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
    },
    { status: 201 }
  );
}

