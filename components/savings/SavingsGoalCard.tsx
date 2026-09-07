'use client';

import React from 'react';
import { Target, PlusCircle, Edit3, Trash2, CheckCircle2, Calendar, History } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';
import { formatRupiah, formatTanggal } from '@/lib/utils/format';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  onAddDeposit: (goal: SavingsGoal) => void;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onShowHistory: (goal: SavingsGoal) => void;
}

export function SavingsGoalCard({
  goal,
  onAddDeposit,
  onEdit,
  onDelete,
  onShowHistory,
}: SavingsGoalCardProps) {
  const percent = Math.min(
    100,
    Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100)
  );

  const isCompleted = percent >= 100;
  const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl transition-all duration-300 hover:border-slate-700 hover:-translate-y-0.5 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-sky-500/10 border-sky-500/20 text-sky-400'}`}>
              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">
                {goal.name}
              </h3>
              {goal.deadline && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target: {formatTanggal(goal.deadline)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onShowHistory(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
              title="Riwayat Setoran"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-all"
              title="Edit Target"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Hapus Target"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Progress: {percent}%</span>
            {isCompleted ? (
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                Target Tercapai 🎉
              </span>
            ) : (
              <span className="text-sky-400">Sisa: {formatRupiah(remaining)}</span>
            )}
          </div>

          <div className="h-3 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/30'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Numbers & Button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Terkumpul</p>
          <p className="text-base font-bold text-slate-100">
            {formatRupiah(goal.current_amount)}
            <span className="text-xs text-slate-400 font-normal"> / {formatRupiah(goal.target_amount)}</span>
          </p>
        </div>

        <button
          onClick={() => onAddDeposit(goal)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Nabung
        </button>
      </div>
    </div>
  );
}
