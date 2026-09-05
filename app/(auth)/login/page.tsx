'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, LogIn, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { loginUser } from '@/lib/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    const res = await loginUser(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  const handleDemoLogin = async () => {
    setEmail('user@example.com');
    setPassword('password123');
    setIsLoading(true);
    const res = await loginUser('user@example.com', 'password123');
    setIsLoading(false);
    if (res.success) {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Masuk ke akun Personal Expense Tracker Anda
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Alamat Email
            </label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-indigo-400 hover:underline font-medium"
              >
                Lupa Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Memproses...' : 'Masuk Ke Akun'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider absolute">
            atau
          </span>
        </div>

        <button
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-950 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 font-semibold text-xs transition-all hover:bg-indigo-500/10"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Masuk Langsung (Mode Demo Instant)
        </button>

        <p className="text-center text-xs text-slate-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-indigo-400 hover:underline font-bold">
            Daftar Sekarang <ArrowRight className="w-3 h-3 inline" />
          </Link>
        </p>
      </div>
    </div>
  );
}
