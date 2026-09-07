'use client';

import React, { useState, useEffect } from 'react';
import { X, History, PiggyBank, Loader2, Inbox, CalendarDays, StickyNote } from 'lucide-react';
import { SavingsGoal, SavingsTransaction } from '@/lib/types';
import { fetchSavingsHistory } from '@/lib/actions/savings';
import { formatRupiah, formatTanggal } from '@/lib/utils/format';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

interface SavingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export function SavingsHistoryModal({ isOpen, onClose, goal }: SavingsHistoryModalProps) {
  const { userId } = useCurrentUser();
  const [history, setHistory] = useState<SavingsTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !goal || !userId) return;

    const load = async () => {
      setIsLoading(true);
      const data = await fetchSavingsHistory(userId, goal.id);
      setHistory(data);
      setIsLoading(false);
    };

    load();
  }, [isOpen, goal, userId]);

  if (!isOpen || !goal) return null;

  const totalDeposited = history.reduce((sum, h) => sum + Number(h.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" />
              Riwayat Setoran
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-slate-500" />
              {goal.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-medium">Terkumpul</span>
              <p className="text-sky-400 font-bold text-base">{formatRupiah(goal.current_amount)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-medium">Target</span>
              <p className="text-slate-300 font-bold text-base">{formatRupiah(goal.target_amount)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <span className="text-slate-500 uppercase tracking-wider font-medium">Setoran</span>
              <p className="text-slate-300 font-bold text-base">{history.length}x</p>
            </div>
          </div>
          {totalDeposited > 0 && (
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
              Total: {formatRupiah(totalDeposited)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <p className="text-sm text-slate-400">Memuat riwayat...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="p-4 bg-slate-800/60 rounded-full">
                <Inbox className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Belum Ada Riwayat Setoran</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Mulai menabung dengan menekan tombol &quot;Nabung&quot; pada kartu target ini.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Reverse index badge */}
                    <div className="shrink-0 w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-sky-400">{history.length - idx}</span>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-emerald-400">
                        + {formatRupiah(item.amount)}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays className="w-3 h-3 text-slate-500" />
                        <span>{formatTanggal(item.transaction_date)}</span>
                      </div>
                      {item.notes && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-0.5">
                          <StickyNote className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
                          <span className="italic">{item.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-sm font-semibold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
