'use client';

import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit3, ArrowDownLeft, ArrowUpRight, PiggyBank, Receipt, AlertCircle } from 'lucide-react';
import { Transaction, Category, TransactionType } from '@/lib/types';
import { formatRupiah, formatTanggal } from '@/lib/utils/format';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: TransactionType | 'all';
  onTypeChange: (type: TransactionType | 'all') => void;
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
}: TransactionListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    await onDelete(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  const getBadgeStyle = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          icon: ArrowDownLeft,
          label: 'Pemasukan',
          prefix: '+',
        };
      case 'expense':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          icon: ArrowUpRight,
          label: 'Pengeluaran',
          prefix: '-',
        };
      case 'savings':
        return {
          bg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
          icon: PiggyBank,
          label: 'Tabungan',
          prefix: '',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={selectedType}
              onChange={e => onTypeChange(e.target.value as TransactionType | 'all')}
              className="bg-transparent text-slate-200 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer py-1 px-1"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                Semua Tipe
              </option>
              <option value="income" className="bg-slate-900 text-slate-200">
                Pemasukan
              </option>
              <option value="expense" className="bg-slate-900 text-slate-200">
                Pengeluaran
              </option>
              <option value="savings" className="bg-slate-900 text-slate-200">
                Tabungan
              </option>
            </select>
          </div>

          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
            <select
              value={selectedCategory}
              onChange={e => onCategoryChange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer py-1 px-1"
            >
              <option value="" className="bg-slate-900 text-slate-200">
                Semua Kategori
              </option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                  {c.name} ({c.type === 'expense' ? 'Pengeluaran' : c.type === 'income' ? 'Pemasukan' : 'Tabungan'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-slate-800/50 rounded-xl w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-slate-800/50 rounded-full text-slate-500">
              <Receipt className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-300">
              Belum Ada Transaksi
            </h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Belum ada transaksi yang sesuai dengan filter atau bulan yang Anda pilih.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {transactions.map(tx => {
              const badge = getBadgeStyle(tx.type);
              const Icon = badge.icon;
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`p-2.5 rounded-xl border ${badge.bg} shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-slate-100 text-base">
                          {tx.description}
                        </h4>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">
                          {tx.categories?.name || 'Lainnya'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{formatTanggal(tx.transaction_date)}</span>
                        {tx.notes && (
                          <span className="truncate max-w-xs text-slate-500 italic">
                            • {tx.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0 border-t sm:border-t-0 border-slate-800/50 pt-2 sm:pt-0">
                    <span className={`text-base sm:text-lg font-bold ${badge.bg.split(' ')[2]}`}>
                      {badge.prefix} {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                        title="Edit Transaksi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Hapus Transaksi?
              </h3>
            </div>
            <p className="text-sm text-slate-400">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
