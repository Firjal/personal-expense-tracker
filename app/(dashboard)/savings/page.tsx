'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, PiggyBank, Target } from 'lucide-react';
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
    if (confirm('Apakah Anda yakin ingin menghapus target tabungan ini?')) {
      const res = await deleteSavingsGoal(userId, id);
      if (res.success) {
        loadData();
      }
    }
  };

  const handleAddDeposit = async (
    goalId: string,
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

  const openDeposit = (goal: SavingsGoal) => {
    setDepositGoal(goal);
    setIsDepositModalOpen(true);
  };

  const openHistory = (goal: SavingsGoal) => {
    setHistoryGoal(goal);
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
            Tetapkan impian tabungan Anda dan catat setiap progres penambahan dana
          </p>
        </div>

        <button
          onClick={openCreateGoal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Target Baru</span>
        </button>
      </div>

      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Seluruh Tabungan Terkumpul
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-400">
            {formatRupiah(totalSavings)}
            {totalTargetAllGoals > 0 && (
              <span className="text-sm text-slate-400 font-normal ml-2">
                dari total target {formatRupiah(totalTargetAllGoals)}
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
          <Target className="w-4 h-4 text-sky-400" />
          <span>{goals.length} Target Aktif</span>
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
            Belum Ada Target Tabungan
          </h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Buat target tabungan pertama Anda seperti menabung untuk laptop, kendaraan, atau dana darurat.
          </p>
          <button
            onClick={openCreateGoal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all"
          >
            Buat Target Sekarang
          </button>
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
        goal={depositGoal}
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
