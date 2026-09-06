import Link from 'next/link';
import { Wallet, ArrowRight, ShieldCheck, PieChart, PiggyBank, History } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            ExpenseTracker
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 text-center my-auto py-12 relative z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
          <ShieldCheck className="w-4 h-4" /> Privasi & Keamanan Data Terjamin
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Kelola Keuangan Pribadi dengan{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Lebih Cerdas & Teratur
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Catat pengeluaran harian, pantau pemasukan, dan capai target tabungan Anda dengan rekap data permanen yang rapi dan aman.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2.5"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl w-fit border border-rose-500/20">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-200">Riwayat Permanen</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Data bulan lalu tersimpan secara aman dan permanen, tanpa reset otomatis saat berganti bulan.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl w-fit border border-sky-500/20">
              <PiggyBank className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-200">Target Tabungan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pantau progress menabung hingga 100% dengan pengingat visual target tercapai 🎉.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-200">Grafik & Laporan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualisasi pengeluaran harian dan persentase kategori lengkap dengan fitur export CSV.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 relative z-10">
        © 2026 Personal Expense Tracker • Next.js & Supabase Powered
      </footer>
    </div>
  );
}
