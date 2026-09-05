'use client';

import React, { useState } from 'react';
import { X, PiggyBank, Save, AlertCircle } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

interface AddSavingsFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  onSubmit: (goalId: string, amount: number, date: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
}

export function AddSavingsFundModal({
  isOpen,
  onClose,
  goal,
  onSubmit,
}: AddSavingsFundModalProps) {
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Nominal tabungan harus lebih besar dari Rp0.');
      return;
    }
    if (!transactionDate) {
      setErrorMsg('Tanggal setoran wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const res = await onSubmit(goal.id, numAmount, transactionDate, notes.trim() || undefined);
    setIsSubmitting(false);

    if (res.success) {
      setAmount('');
      setNotes('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-sky-400" />
              Nabung: {goal.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Terkumpul: <span className="text-sky-400 font-semibold">{formatRupiah(goal.current_amount)}</span> / {formatRupiah(goal.target_amount)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Nominal Setoran (Rp) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              placeholder="Contoh: 100000"
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all font-semibold"
              required
            />
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-xs text-sky-400 mt-1 font-medium">
                = {formatRupiah(parseFloat(amount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tanggal Setoran <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Dari sisa gaji"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Tambah Tabungan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
