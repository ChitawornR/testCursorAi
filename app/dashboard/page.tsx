import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { findUserById, listActiveUsersExcluding } from "@/lib/db";
import AdminUsersPanel from "./AdminUsersPanel";

export default async function DashboardPage() {
  const session = await getSessionUser();
  if (!session) {
    console.log('dashboard: no session')
    redirect("/login");
  }
  if (session?.role === "user"){
    redirect("/")
  }

  const data = await listActiveUsersExcluding(session.id)
    

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">
              Dashboard
            </p>
            <h1 className="text-3xl font-semibold">
              Welcome back, {session.name}
            </h1>
            <p className="text-sm text-slate-300/80">
              Role:{" "}
              <span className="font-medium text-emerald-200">
                {session.role}
              </span>
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
            <h2 className="text-xl font-semibold">Manage Users</h2>

            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-200">
              Admin View
            </span>
          </div>

          <AdminUsersPanel initialUsers={data} />

          {!data?.length && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-slate-300">
              No users found.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
