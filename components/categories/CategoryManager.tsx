'use client';

import React, { useState } from 'react';
import { PlusCircle, Tag, Edit3, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Category, TransactionType } from '@/lib/types';

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (name: string, type: TransactionType) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (id: string, name: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

export function CategoryManager({
  categories,
  onCreate,
  onUpdate,
  onDelete,
  isLoading,
}: CategoryManagerProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const openCreate = () => {
    setEditCategory(null);
    setNameInput('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditCategory(cat);
    setNameInput(cat.name);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nameInput.trim()) {
      setErrorMsg('Nama kategori wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    let res;
    if (editCategory) {
      res = await onUpdate(editCategory.id, nameInput.trim());
    } else {
      res = await onCreate(nameInput.trim(), activeTab);
    }
    setIsSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
    } else {
      setErrorMsg(res.error || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      const res = await onDelete(id);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus kategori.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Kelola Kategori
            </h2>
            <p className="text-xs text-slate-400">
              Kategori default & kategori buatan Anda sendiri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Selector Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            {[
              { label: 'Pengeluaran', type: 'expense' },
              { label: 'Pemasukan', type: 'income' },
              { label: 'Tabungan', type: 'savings' },
            ].map(tab => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type as TransactionType)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.type
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-16 bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Belum ada kategori untuk tipe ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className="font-semibold text-slate-200 text-sm">
                    {cat.name}
                  </span>
                  {cat.is_default && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Default
                    </span>
                  )}
                </div>

                {!cat.is_default && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                      title="Edit Nama"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">
              {editCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Nama Kategori <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Langganan Stream, Investasi"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-semibold transition-all hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
