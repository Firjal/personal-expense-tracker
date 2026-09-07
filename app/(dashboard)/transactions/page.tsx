'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFormModal } from '@/components/transactions/TransactionFormModal';
import { ExportCsvButton } from '@/components/export/ExportCsvButton';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/actions/transactions';
import { fetchCategories } from '@/lib/actions/categories';
import { Transaction, Category, TransactionType } from '@/lib/types';

export default function TransactionsPage() {
  const { userId, isReady } = useCurrentUser();

  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(currentDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState<number>(currentDate.getFullYear());

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    setIsLoading(true);

    const [txData, catData] = await Promise.all([
      fetchTransactions(userId, {
        month: currentMonth,
        year: currentYear,
        type: selectedType,
        categoryId: selectedCategory || undefined,
        searchQuery: searchQuery || undefined,
      }),
      fetchCategories(userId),
    ]);

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
    if (res.success) loadData();
    return res;
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTransaction(userId, id);
    if (res.success) loadData();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-indigo-400" />
            Riwayat Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola, cari, dan filter seluruh catatan pengeluaran, pemasukan, dan tabungan Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportCsvButton
            transactions={transactions}
            month={currentMonth}
            year={currentYear}
          />
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <MonthSelector
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
      />

      {/* List */}
      <TransactionList
        transactions={transactions}
        categories={categories}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Modal Form */}
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
