'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Transaction } from '@/lib/types';
import { formatRupiah, CHART_COLORS } from '@/lib/utils/format';

interface FinancialChartsProps {
  transactions: Transaction[];
  month: number;
  year: number;
}

export function FinancialCharts({ transactions, month, year }: FinancialChartsProps) {
  // 1. Compute Daily Expenses
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const map: Record<number, { day: string; expense: number; income: number }> = {};

    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = {
        day: `${d}`,
        expense: 0,
        income: 0,
      };
    }

    transactions.forEach(t => {
      const date = new Date(t.transaction_date + 'T00:00:00');
      const dayNum = date.getDate();
      if (map[dayNum]) {
        if (t.type === 'expense') {
          map[dayNum].expense += Number(t.amount);
        } else if (t.type === 'income') {
          map[dayNum].income += Number(t.amount);
        }
      }
    });

    return Object.values(map);
  }, [transactions, month, year]);

  // 2. Compute Expenses by Category
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const catName = t.categories?.name || 'Lainnya';
        map[catName] = (map[catName] || 0) + Number(t.amount);
      }
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  // 3. Compute Income vs Expense vs Savings Totals
  const comparisonData = useMemo(() => {
    let income = 0;
    let expense = 0;
    let savings = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') income += amt;
      else if (t.type === 'expense') expense += amt;
      else if (t.type === 'savings') savings += amt;
    });

    return [
      { name: 'Pemasukan', total: income, fill: '#10b981' },
      { name: 'Pengeluaran', total: expense, fill: '#f43f5e' },
      { name: 'Tabungan', total: savings, fill: '#38bdf8' },
    ];
  }, [transactions]);

  interface ChartTooltipEntry {
    name?: string;
    value?: number;
    color?: string;
  }

  interface ChartTooltipProps {
    active?: boolean;
    payload?: ChartTooltipEntry[];
    label?: string | number;
  }

  const CustomTooltip = ({ active, payload, label }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200">{`Tanggal ${label}`}</p>
          {payload.map((entry: ChartTooltipEntry, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatRupiah(entry.value || 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CategoryTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-200">{payload[0].name}</p>
          <p className="text-indigo-400 font-bold">{formatRupiah(payload[0].value || 0)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Daily Expenses Bar Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Pengeluaran Per Hari
          </h3>
          <p className="text-xs text-slate-400">
            Grafik total pengeluaran harian pada bulan ini
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={val => `Rp${val / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Expenses by Category Pie Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Pengeluaran Berdasarkan Kategori
          </h3>
          <p className="text-xs text-slate-400">
            Proporsi pengeluaran berdasarkan kategori transaksi
          </p>
        </div>

        <div className="h-64 w-full">
          {categoryData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Belum ada pengeluaran pada bulan ini.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CategoryTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={value => <span className="text-xs text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Income vs Expense vs Savings Comparison */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 lg:col-span-2">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Perbandingan Pemasukan, Pengeluaran & Tabungan
          </h3>
          <p className="text-xs text-slate-400">
            Perbandingan total aliran dana dalam bulan ini
          </p>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={val => `Rp${val / 1000}k`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={100} />
              <Tooltip
                formatter={(val) => [formatRupiah(typeof val === 'number' ? val : 0), 'Total']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={24}>
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
