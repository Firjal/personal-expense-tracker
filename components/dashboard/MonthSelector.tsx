'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { BULAN_INDONESIA } from '@/lib/utils/format';

interface MonthSelectorProps {
  currentMonth: number; // 1-12
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export function MonthSelector({
  currentMonth,
  currentYear,
  onMonthChange,
}: MonthSelectorProps) {
  const handlePrev = () => {
    if (currentMonth === 1) {
      onMonthChange(12, currentYear - 1);
    } else {
      onMonthChange(currentMonth - 1, currentYear);
    }
  };

  const handleNext = () => {
    if (currentMonth === 12) {
      onMonthChange(1, currentYear + 1);
    } else {
      onMonthChange(currentMonth + 1, currentYear);
    }
  };

  const handleSelectMonth = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = parseInt(e.target.value, 10);
    onMonthChange(month, currentYear);
  };

  const handleSelectYear = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    onMonthChange(currentMonth, year);
  };

  // Generate range of years (e.g. 5 years past to 5 years future)
  const currentActualYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentActualYear - 5 + i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-lg">
      <div className="flex items-center gap-2 text-slate-300 font-medium">
        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
          <Calendar className="w-5 h-5" />
        </div>
        <span className="text-sm sm:text-base font-semibold text-slate-200">
          Periode Keuangan
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/50"
          title="Bulan Sebelumnya"
          aria-label="Bulan Sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-2 py-1">
          <select
            value={currentMonth}
            onChange={handleSelectMonth}
            className="bg-transparent text-slate-100 font-semibold text-sm sm:text-base focus:outline-none cursor-pointer py-1 px-1"
          >
            {BULAN_INDONESIA.map((nama, idx) => (
              <option key={idx} value={idx + 1} className="bg-slate-900 text-slate-200">
                {nama}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={handleSelectYear}
            className="bg-transparent text-indigo-400 font-bold text-sm sm:text-base focus:outline-none cursor-pointer py-1 px-1"
          >
            {yearOptions.map(yr => (
              <option key={yr} value={yr} className="bg-slate-900 text-slate-200">
                {yr}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNext}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700/50"
          title="Bulan Berikutnya"
          aria-label="Bulan Berikutnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
