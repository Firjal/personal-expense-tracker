'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Award, Receipt } from 'lucide-react';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { FinancialCharts } from '@/components/reports/FinancialCharts';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { ExportCsvButton } from '@/components/export/ExportCsvButton';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { fetchTransactions, getMonthlySummary } from '@/lib/actions/transactions';
import { Transaction, MonthlyFinancialSummary } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

export default function ReportsPage() {
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
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    setIsLoading(true);

    const [sumData, txData] = await Promise.all([
      getMonthlySummary(userId, currentMonth, currentYear),
      fetchTransactions(userId, { month: currentMonth, year: currentYear }),
    ]);

    setSummary(sumData);
    setTransactions(txData);
    setIsLoading(false);
  }, [userId, isReady, currentMonth, currentYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            Laporan & Rekap Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analisis mendalam pengeluaran, pemasukan, dan grafik visualisasi bulanan
          </p>
        </div>

        <ExportCsvButton
          transactions={transactions}
          month={currentMonth}
          year={currentYear}
          filenamePrefix="laporan_analisis_keuangan"
        />
      </div>

      {/* Month Selector */}
      <MonthSelector
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
      />

      {/* Financial Overview Cards */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* Stats Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Jumlah Transaksi</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-slate-100">
            {summary.transactionCount} Transaksi
          </p>
          <p className="text-[11px] text-slate-500">Tercatat bulan ini</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pengeluaran Terbesar</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-bold text-rose-400">
            {summary.largestExpense ? formatRupiah(summary.largestExpense.amount) : 'Rp0'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {summary.largestExpense ? `${summary.largestExpense.description} (${summary.largestExpense.categoryName})` : '-'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Pemasukan Terbesar</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400">
            {summary.largestIncome ? formatRupiah(summary.largestIncome.amount) : 'Rp0'}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {summary.largestIncome ? `${summary.largestIncome.description} (${summary.largestIncome.categoryName})` : '-'}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Top Kategori Pengeluaran</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400 truncate">
            {summary.topExpenseCategory ? summary.topExpenseCategory.name : '-'}
          </p>
          <p className="text-[11px] text-slate-400">
            {summary.topExpenseCategory ? formatRupiah(summary.topExpenseCategory.amount) : 'Rp0'}
          </p>
        </div>
      </div>

      {/* Visual Recharts Section */}
      <FinancialCharts
        transactions={transactions}
        month={currentMonth}
        year={currentYear}
      />
    </div>
  );
}
