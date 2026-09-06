'use client';

import React from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/actions/auth';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Profile Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/30 border border-indigo-400/30 shrink-0">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold text-white">
              {user?.full_name || 'Pengguna'}
            </h2>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Personal Account
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {user?.email || 'user@example.com'}
          </p>
          <p className="text-xs text-slate-500 pt-1">
            User ID: <code className="bg-slate-950 px-2 py-0.5 rounded text-slate-300 font-mono">{user?.id || 'demo-user-123'}</code>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Keluar Akun
        </button>
      </div>

      {/* Security & Isolation Card */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-2">
        <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
          <ShieldCheck className="w-5 h-5" />
          <span>Keamanan & Data Isolation (Supabase RLS)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Seluruh data transaksi, kategori, dan target tabungan dilindungi oleh kebijakan <strong>Row Level Security (RLS)</strong> di Supabase PostgreSQL. Setiap pengguna hanya memiliki akses untuk membaca, menambah, mengubah, dan menghapus data milik mereka sendiri.
        </p>
      </div>
    </div>
  );
}
