import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { findUserById, listActiveUsersExcluding } from '@/lib/db';
import AdminUsersPanel from './AdminUsersPanel';

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.role === 'admin';
  const data = isAdmin
    ? await listActiveUsersExcluding(session.id)
    : [await findUserById(session.id)].filter(Boolean);

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(value));

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold">
              Welcome back, {session.name}
            </h1>
            <p className="text-sm text-slate-300/80">
              Role: <span className="font-medium text-emerald-200">{session.role}</span>
            </p>
          </div>
          <form action="/api/logout" method="post">
            <button
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
              type="submit"
            >
              Logout
            </button>
          </form>
        </header>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {isAdmin ? 'Manage Users' : 'Your Profile'}
            </h2>
            {isAdmin && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-200">
                Admin View
              </span>
            )}
          </div>

          {isAdmin ? (
            <AdminUsersPanel initialUsers={data} />
          ) : (
            <div className="mt-6 grid gap-4">
              {data?.map((user) => (
                <div
                  key={user!.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{user!.name}</p>
                      <p className="text-sm text-slate-300">{user!.email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
                      {user!.role}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-300 sm:grid-cols-3">
                    <p>
                      <span className="text-slate-400">Created:</span>{' '}
                        {formatDate(user!.createdAt)}
                    </p>
                    <p>
                      <span className="text-slate-400">Updated:</span>{' '}
                        {formatDate(user!.updatedAt)}
                    </p>
                    <p className="text-emerald-200">
                      Status:{' '}
                      {user!.deleteAt ? (
                        <span className="text-red-300">Deleted</span>
                      ) : (
                        'Active'
                      )}
                    </p>
                  </div>
                </div>
              ))}

              {!data?.length && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
                  No users found.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

