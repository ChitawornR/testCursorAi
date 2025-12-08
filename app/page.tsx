export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-100 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
          Auth Demo
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Welcome</h1>
        <p className="mt-2 text-slate-200">
          Login or create a new account to access the dashboard.
          </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/login"
            className="w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 sm:w-auto"
          >
            Login
          </a>
          <a
            href="/register"
            className="w-full rounded-full border border-emerald-200/50 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300 sm:w-auto"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
