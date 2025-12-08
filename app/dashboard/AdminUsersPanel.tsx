'use client';

import { useEffect, useMemo, useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deleteAt: string | null;
};

type Props = {
  initialUsers: User[];
};

const emptyForm = { name: '', email: '', password: '', role: 'user' as string };
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value));

export default function AdminUsersPanel({ initialUsers }: Props) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 2500);
  };

  const refresh = async () => {
    const res = await fetch('/api/admin/users', { cache: 'no-store' });
    if (!res.ok) {
      showError('โหลดข้อมูลไม่สำเร็จ');
      return;
    }
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    // Ensure latest after any admin action elsewhere.
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isEditing && editingId) {
        const res = await fetch(`/api/admin/users/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            password: form.password || undefined,
          }),
        });
        if (!res.ok) throw new Error('แก้ไขไม่สำเร็จ');
        await refresh();
        showMessage('อัปเดตผู้ใช้แล้ว');
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('สร้างผู้ใช้ไม่สำเร็จ');
        await refresh();
        showMessage('สร้างผู้ใช้แล้ว');
      }
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      showError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(u: User) {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: number) {
    if (!confirm('ยืนยันลบผู้ใช้นี้?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('ลบไม่สำเร็จ');
      await refresh();
      showMessage('ลบผู้ใช้แล้ว');
      if (editingId === id) cancelEdit();
    } catch (err: any) {
      showError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-200/80">
            {isEditing ? 'Edit User' : 'Create User'}
          </p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {isEditing ? 'แก้ไขผู้ใช้' : 'สร้างผู้ใช้ใหม่'}
          </h3>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm text-slate-300">ชื่อ</label>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none ring-emerald-400/50 focus:ring"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">อีเมล</label>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none ring-emerald-400/50 focus:ring"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">
                {isEditing ? 'รหัสผ่าน (ถ้าเปลี่ยน)' : 'รหัสผ่าน'}
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none ring-emerald-400/50 focus:ring"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required={!isEditing}
                placeholder={isEditing ? 'เว้นว่างถ้าไม่เปลี่ยน' : ''}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Role</label>
              <select
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none ring-emerald-400/50 focus:ring"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:opacity-60"
              >
                {loading ? 'กำลังบันทึก...' : isEditing ? 'อัปเดต' : 'สร้าง'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  ยกเลิก
                </button>
              )}
            </div>
            {message && <p className="text-sm text-emerald-200">{message}</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">ผู้ใช้ทั้งหมด</h3>
            <button
              onClick={refresh}
              className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase text-emerald-200 transition hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead>
                <tr className="text-left text-slate-300">
                  <th className="py-2">ชื่อ</th>
                  <th className="py-2">อีเมล</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">สร้างเมื่อ</th>
                  <th className="py-2 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="text-slate-200">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3 text-slate-300">{u.email}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="rounded-lg bg-red-500/80 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-400"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!users.length && (
                  <tr>
                    <td className="py-6 text-center text-slate-400" colSpan={5}>
                      ไม่มีผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

