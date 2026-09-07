'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react';
import { MonthlyFinancialSummary } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

interface SummaryCardsProps {
  summary: MonthlyFinancialSummary;
  isLoading?: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-32 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 w-24 bg-slate-800 rounded" />
            <div className="h-8 w-36 bg-slate-800 rounded" />
            <div className="h-3 w-28 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Pemasukan',
      amount: summary.totalIncome,
      icon: ArrowDownLeft,
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      gradient: 'from-emerald-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Total Pengeluaran',
      amount: summary.totalExpense,
      icon: ArrowUpRight,
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10 border-rose-500/20',
      gradient: 'from-rose-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Total Tabungan',
      amount: summary.totalSavings,
      icon: PiggyBank,
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-500/10 border-sky-500/20',
      gradient: 'from-sky-500/10 via-slate-900 to-slate-900',
    },
    {
      title: 'Sisa Uang',
      amount: summary.balance,
      icon: Wallet,
      colorClass: summary.balance >= 0 ? 'text-indigo-400' : 'text-amber-400',
      bgClass: 'bg-indigo-500/10 border-indigo-500/20',
      gradient: 'from-indigo-500/15 via-slate-900 to-slate-900',
      isBalance: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b ${card.gradient} p-5 shadow-xl transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.bgClass} ${card.colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${card.colorClass}`}>
                {formatRupiah(card.amount)}
              </h3>
              {card.isBalance ? (
                <p className="text-xs text-slate-400 font-medium">
                  Pemasukan − Pengeluaran − Tabungan
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Total bulan ini
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
