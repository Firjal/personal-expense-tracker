'use client';

import React, { useState, useEffect } from 'react';
import { X, PiggyBank, Save, AlertCircle } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

interface AddSavingsFundModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: SavingsGoal[];
  selectedGoal?: SavingsGoal | null;
  onSubmit: (goalId: string | null, amount: number, date: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
}

export function AddSavingsFundModal({
  isOpen,
  onClose,
  goals,
  selectedGoal,
  onSubmit,
}: AddSavingsFundModalProps) {
  const [goalId, setGoalId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedGoal) {
      setGoalId(selectedGoal.id);
    } else if (goals.length > 0) {
      setGoalId(goals[0].id);
    } else {
      setGoalId('');
    }
    setAmount('');
    setNotes('');
    setErrorMsg('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
  }, [selectedGoal, goals, isOpen]);

  if (!isOpen) return null;

  const currentGoal = goals.find(g => g.id === goalId) || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Nominal tabungan harus lebih besar dari Rp0.');
      return;
    }
    if (!transactionDate) {
      setErrorMsg('Tanggal setoran wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const res = await onSubmit(
      goalId ? goalId : null,
      numAmount,
      transactionDate,
      notes.trim() || undefined
    );
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
              {currentGoal ? `Nabung: ${currentGoal.name}` : 'Tambah Tabungan'}
            </h2>
            {currentGoal ? (
              <p className="text-xs text-slate-400 mt-0.5">
                Terkumpul saat ini: <span className="text-sky-400 font-semibold">{formatRupiah(currentGoal.current_amount)}</span> / {formatRupiah(currentGoal.target_amount)}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">
                Simpan dana ke saldo tabungan
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
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
          {/* Target Alokasi (opsional jika ingin bebas) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Alokasi Target
            </label>
            <select
              value={goalId}
              onChange={e => setGoalId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer"
            >
              <option value="">Tabungan Bebas (Tanpa Target)</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} (Terkumpul: {formatRupiah(g.current_amount)})
                </option>
              ))}
            </select>
          </div>

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
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
