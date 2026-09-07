'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ArrowRight, Receipt, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { TransactionList } from '@/components/transactions/TransactionList';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
} from '@/lib/actions/transactions';
import { fetchCategories } from '@/lib/actions/categories';
import { Transaction, Category, MonthlyFinancialSummary, TransactionType } from '@/lib/types';

export default function DashboardPage() {
  const { userId, isReady } = useCurrentUser();

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(currentDate.getFullYear());

  const [summary, setSummary] = useState<MonthlyFinancialSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleTypeChange = (type: TransactionType | 'all') => {
    setSelectedType(type);
  };

  const loadData = useCallback(async () => {
    if (!isReady) return;
    setIsLoading(true);

    const activeCategoryId = selectedCategory || undefined;

    const [sumData, txData, catData] = await Promise.all([
      getMonthlySummary(userId, currentMonth, currentYear),
      fetchTransactions(userId, {
        month: currentMonth,
        year: currentYear,
        type: selectedType,
        categoryId: activeCategoryId,
        searchQuery: searchQuery || undefined,
      }),
      fetchCategories(userId),
    ]);

    setSummary(sumData);
    setTransactions(txData);
    setCategories(catData);
    setIsLoading(false);
  }, [userId, isReady, currentMonth, currentYear, selectedType, selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleCreateOrUpdate = async (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category_id?: string | null;
    transaction_date: string;
    notes?: string;
  }) => {
    let res;
    if (editingTransaction) {
      res = await updateTransaction(userId, editingTransaction.id, data);
    } else {
      res = await createTransaction(userId, data);
    }

    if (res.success) {
      loadData();
    }
    return res;
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTransaction(userId, id);
    if (res.success) {
      loadData();
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Demo Notice Banner if Supabase env is not configured */}
      {!isSupabaseConfigured() && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-indigo-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-xs sm:text-sm">
              <span className="font-bold text-white">Mode Demo Aktif:</span> Aplikasi berjalan dengan penyimpanan lokal berkecepatan tinggi. Sambungkan Supabase URL & Key di <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-200">.env.local</code> untuk menyambungkan ke PostgreSQL secara langsung.
            </p>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-indigo-400 hover:text-white bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/30 shrink-0 transition-all"
          >
            Lihat Schema SQL
          </Link>
        </div>
      )}

      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau arus kas, pengeluaran, dan tabungan Anda berdasarkan periode
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Transaksi</span>
        </button>
      </div>

      {/* Month & Year Selector */}
      <MonthSelector
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
      />

      {/* Financial Summary Cards */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Transaksi Bulan Ini ({summary.transactionCount})
            </h2>
          </div>

          <Link
            href="/transactions"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
          >
            Lihat Semua History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <TransactionList
          transactions={transactions}
          categories={categories}
          onEdit={openEditModal}
          onDelete={handleDelete}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateOrUpdate}
        categories={categories}
        initialData={editingTransaction}
      />
    </div>
  );
}
