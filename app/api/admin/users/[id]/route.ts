import { NextResponse } from 'next/server';
import { findUserById, softDeleteUser, updateUser } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  if (id === session.id) {
    return NextResponse.json({ error: 'Cannot edit self here' }, { status: 400 });
  }

  const body = await req.json();
  const fields: { name?: string; email?: string; password?: string; role?: string } = {};
  if (body.name) fields.name = body.name;
  if (body.email) fields.email = body.email;
  if (body.role) fields.role = body.role === 'admin' ? 'admin' : 'user';
  if (body.password) fields.password = await hashPassword(body.password);

  const updated = await updateUser(id, fields);
  if (!updated) {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }

  const user = await findUserById(id);
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  if (id === session.id) {
    return NextResponse.json({ error: 'Cannot delete self' }, { status: 400 });
  }

  const deleted = await softDeleteUser(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

