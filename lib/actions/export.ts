import { Transaction } from '@/lib/types';
import { formatTanggal } from '@/lib/utils/format';

export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Tanggal', 'Tipe', 'Keterangan', 'Kategori', 'Nominal (Rp)', 'Catatan'];

  const rows = transactions.map(t => {
    const tanggal = formatTanggal(t.transaction_date, 'full');
    const tipe = t.type === 'expense' ? 'Pengeluaran' : t.type === 'income' ? 'Pemasukan' : 'Tabungan';
    const keterangan = `"${(t.description || '').replace(/"/g, '""')}"`;
    const kategori = t.type === 'savings' ? '""' : `"${(t.categories?.name || 'Tanpa Kategori').replace(/"/g, '""')}"`;
    const nominal = t.amount;
    const catatan = `"${(t.notes || '').replace(/"/g, '""')}"`;

    return [tanggal, tipe, keterangan, kategori, nominal, catatan].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
