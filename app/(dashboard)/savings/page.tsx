'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, PiggyBank, Target, History, PlusCircle, ShieldCheck } from 'lucide-react';
import { SavingsGoalCard } from '@/components/savings/SavingsGoalCard';
import { SavingsGoalModal } from '@/components/savings/SavingsGoalModal';
import { AddSavingsFundModal } from '@/components/savings/AddSavingsFundModal';
import { SavingsHistoryModal } from '@/components/savings/SavingsHistoryModal';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import {
  fetchSavingsGoals,
  fetchTotalSavings,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addSavingsDeposit,
} from '@/lib/actions/savings';
import { SavingsGoal } from '@/lib/types';
import { formatRupiah } from '@/lib/utils/format';

export default function SavingsPage() {
  const { userId, isReady } = useCurrentUser();

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyGoal, setHistoryGoal] = useState<SavingsGoal | null>(null);

  const loadData = useCallback(async () => {
    if (!isReady) return;
    setIsLoading(true);
    const [goalsData, totalSavingsData] = await Promise.all([
      fetchSavingsGoals(userId),
      fetchTotalSavings(userId),
    ]);
    setGoals(goalsData);
    setTotalSavings(totalSavingsData);
    setIsLoading(false);
  }, [userId, isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateOrUpdateGoal = async (data: {
    name: string;
    target_amount: number;
    deadline?: string;
  }) => {
    let res;
    if (editingGoal) {
      res = await updateSavingsGoal(userId, editingGoal.id, data);
    } else {
      res = await createSavingsGoal(userId, data);
    }

    if (res.success) {
      loadData();
    }
    return res;
  };

  const handleDeleteGoal = async (id: string) => {
    if (
      confirm(
        'Apakah Anda yakin ingin menghapus target tabungan ini?\n\nCatatan: Target akan dihapus, tetapi seluruh uang yang telah Anda tabung TETAP AMAN dan tidak akan berkurang dari Total Tabungan Anda.'
      )
    ) {
      const res = await deleteSavingsGoal(userId, id);
      if (res.success) {
        loadData();
      }
    }
  };

  const handleAddDeposit = async (
    goalId: string | null,
    amount: number,
    date: string,
    notes?: string
  ) => {
    const res = await addSavingsDeposit(userId, goalId, amount, date, notes);
    if (res.success) {
      loadData();
    }
    return res;
  };

  const openCreateGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const openDeposit = (goal?: SavingsGoal) => {
    setDepositGoal(goal || null);
    setIsDepositModalOpen(true);
  };

  const openHistory = (goal?: SavingsGoal) => {
    setHistoryGoal(goal || null);
    setIsHistoryModalOpen(true);
  };

  const totalTargetAllGoals = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <PiggyBank className="w-7 h-7 text-sky-400" />
            Target & Menabung
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola seluruh dana tabungan dan tetapkan tujuan alokasi impian Anda
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openDeposit()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nabung Sekarang</span>
          </button>

          <button
            onClick={openCreateGoal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Target Baru</span>
          </button>
        </div>
      </div>

      {/* Overview Banner: Total Seluruh Tabungan Terkumpul */}
      <div className="relative overflow-hidden bg-gradient-to-r from-sky-950/70 via-slate-900 to-indigo-950/70 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Seluruh Tabungan Terkumpul
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Saldo Permanen
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-sky-400 tracking-tight">
              {formatRupiah(totalSavings)}
            </h2>
            <p className="text-xs text-slate-400">
              Total seluruh uang yang telah Anda tabung. Saldo tabungan tetap aman dan tidak akan berkurang meskipun target dihapus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950/70 border border-slate-800 px-3.5 py-2.5 rounded-xl">
              <Target className="w-4 h-4 text-sky-400" />
              <span>{goals.length} Target Aktif</span>
              {totalTargetAllGoals > 0 && (
                <span className="text-slate-500">
                  (Target: {formatRupiah(totalTargetAllGoals)})
                </span>
              )}
            </div>

            <button
              onClick={() => openHistory()}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Riwayat Seluruh Tabungan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-slate-900/60 border border-slate-800 rounded-2xl p-5" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-sky-500/10 rounded-full text-sky-400">
            <PiggyBank className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {totalSavings > 0
              ? 'Belum Ada Target Aktif'
              : 'Belum Ada Target Tabungan'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            {totalSavings > 0
              ? `Anda telah memiliki saldo tabungan sebesar ${formatRupiah(totalSavings)}. Buat target tabungan untuk mengalokasikan tabungan Anda.`
              : 'Tetapkan target impian Anda seperti tabungan laptop, kendaraan, atau dana darurat untuk memantau perkembangannya.'}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => openDeposit()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Nabung Bebas
            </button>
            <button
              onClick={openCreateGoal}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Buat Target Baru
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(goal => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onAddDeposit={openDeposit}
              onEdit={openEditGoal}
              onDelete={handleDeleteGoal}
              onShowHistory={openHistory}
            />
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSubmit={handleCreateOrUpdateGoal}
        initialData={editingGoal}
      />

      {/* Deposit Modal */}
      <AddSavingsFundModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        goals={goals}
        selectedGoal={depositGoal}
        onSubmit={handleAddDeposit}
      />

      {/* History Modal */}
      <SavingsHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        goal={historyGoal}
      />
    </div>
  );
}
