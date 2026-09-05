'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { exportTransactionsToCSV, downloadCSV } from '@/lib/actions/export';
import { formatBulanTahun } from '@/lib/utils/format';

interface ExportCsvButtonProps {
  transactions: Transaction[];
  month?: number;
  year?: number;
  filenamePrefix?: string;
}

export function ExportCsvButton({
  transactions,
  month,
  year,
  filenamePrefix = 'laporan-keuangan',
}: ExportCsvButtonProps) {
  const handleExport = () => {
    if (transactions.length === 0) {
      alert('Tidak ada data transaksi untuk diexport.');
      return;
    }

    const csvData = exportTransactionsToCSV(transactions);
    let filename = `${filenamePrefix}.csv`;
    if (month && year) {
      const monthStr = formatBulanTahun(month, year).replace(/\s+/g, '_').toLowerCase();
      filename = `${filenamePrefix}_${monthStr}.csv`;
    }

    downloadCSV(filename, csvData);
  };

  return (
    <button
      onClick={handleExport}
      disabled={transactions.length === 0}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm"
      title="Export Ke CSV"
    >
      <Download className="w-4 h-4 text-indigo-400" />
      <span>Export CSV</span>
    </button>
  );
}
