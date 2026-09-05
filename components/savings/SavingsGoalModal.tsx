'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, Save, AlertCircle } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; target_amount: number; deadline?: string }) => Promise<{ success: boolean; error?: string }>;
  initialData?: SavingsGoal | null;
}

export function SavingsGoalModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: SavingsGoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setTargetAmount(String(initialData.target_amount));
      setDeadline(initialData.deadline || '');
    } else {
      setName('');
      setTargetAmount('');
      setDeadline('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const target = parseFloat(targetAmount);

    if (!name.trim()) {
      setErrorMsg('Nama target tabungan wajib diisi.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setErrorMsg('Target nominal harus lebih besar dari Rp0.');
      return;
    }

    setIsSubmitting(true);
    const res = await onSubmit({
      name: name.trim(),
      target_amount: target,
      deadline: deadline || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-400" />
            {initialData ? 'Edit Target Tabungan' : 'Buat Target Tabungan'}
          </h2>
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
              Nama Target <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Laptop Gaming, Kendaraan"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Target Nominal (Rp) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              placeholder="5000000"
              min="1"
              step="any"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all font-semibold"
              required
            />
            {targetAmount && !isNaN(parseFloat(targetAmount)) && (
              <p className="text-xs text-sky-400 mt-1 font-medium">
                = {formatRupiah(parseFloat(targetAmount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tenggat Waktu / Deadline (Opsional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
