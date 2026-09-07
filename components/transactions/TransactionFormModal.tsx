'use client';

import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Save, AlertCircle } from 'lucide-react';
import { Category, Transaction, TransactionType } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category_id: string;
    transaction_date: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  categories: Category[];
  initialData?: Transaction | null;
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}: TransactionFormModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDescription(initialData.description);
      setAmount(String(initialData.amount));
      setCategoryId(initialData.category_id || '');
      setTransactionDate(initialData.transaction_date);
      setNotes(initialData.notes || '');
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategoryId('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  // Filter categories by chosen transaction type
  const filteredCategories = categories.filter(c => c.type === type);

  // Auto-select first category if none selected
  useEffect(() => {
    if (!categoryId && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [type, filteredCategories, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));

    if (!description.trim()) {
      setErrorMsg('Keterangan transaksi wajib diisi.');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih besar dari Rp0.');
      return;
    }
    if (!transactionDate) {
      setErrorMsg('Tanggal transaksi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      description: description.trim(),
      amount: numAmount,
      type,
      category_id: categoryId,
      transaction_date: transactionDate,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      onClose();
    } else {
      setErrorMsg(result.error || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            {initialData ? 'Edit Transaksi' : 'Tambah Transaksi'}
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
          {/* Tipe Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Tipe Transaksi
            </label>
            <div className={`grid ${initialData?.type === 'savings' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
              {[
                { label: 'Pengeluaran', value: 'expense', color: 'peer-checked:bg-rose-500/20 peer-checked:text-rose-400 peer-checked:border-rose-500/40' },
                { label: 'Pemasukan', value: 'income', color: 'peer-checked:bg-emerald-500/20 peer-checked:text-emerald-400 peer-checked:border-emerald-500/40' },
                ...(initialData?.type === 'savings'
                  ? [{ label: 'Tabungan (Data Lama)', value: 'savings', color: 'peer-checked:bg-sky-500/20 peer-checked:text-sky-400 peer-checked:border-sky-500/40' }]
                  : []),
              ].map(t => (
                <label key={t.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="tx_type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => {
                      setType(t.value as TransactionType);
                      setCategoryId('');
                    }}
                    className="peer sr-only"
                  />
                  <div className={`py-2 px-3 text-center rounded-xl border border-slate-800 bg-slate-950/60 text-slate-400 text-sm font-semibold transition-all hover:bg-slate-800 ${t.color}`}>
                    {t.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Keterangan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Nasi Padang, Uang Bulanan"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              required
            />
          </div>

          {/* Nominal & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nominal (Rp) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                min="1"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all font-semibold"
                required
              />
              {amount && !isNaN(parseFloat(amount)) && (
                <p className="text-xs text-indigo-400 mt-1 font-medium">
                  = {formatRupiah(parseFloat(amount))}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all cursor-pointer"
                required
              >
                {filteredCategories.length === 0 ? (
                  <option value="">Lainnya</option>
                ) : (
                  filteredCategories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Tanggal Transaksi <span className="text-rose-400">*</span>
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={e => setTransactionDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
              required
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Catatan (Opsional)
            </label>
            <textarea
              placeholder="Catatan tambahan..."
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Actions */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
