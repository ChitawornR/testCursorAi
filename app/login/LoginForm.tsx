'use client';

import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { log } from 'console';


export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.role === "admin"){
        console.log('this is admin')
        router.replace('/dashboard');
      }else{
        router.replace('/')
      }

    } catch (err) {
      console.error(err);
      setError('Unexpected error');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Login</h1>
          <p className="text-sm text-slate-300">Access your dashboard</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-200">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-300">
          No account?{' '}
          <Link className="font-semibold text-emerald-300" href="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

