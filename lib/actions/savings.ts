import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';
import { SavingsGoal, SavingsTransaction } from '@/lib/types';

// ─── Fetch all savings goals for a user ──────────────────────────────────────
export async function fetchSavingsGoals(userId: string): Promise<SavingsGoal[]> {
  if (!isSupabaseConfigured()) {
    return DemoStore.getSavingsGoals(userId);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching savings goals:', error);
    return [];
  }

  return data as SavingsGoal[];
}

// ─── Total savings = sum of ALL active savings transactions for the user ──────
// Can be all-time (default) or filtered by month and year.
export async function fetchTotalSavings(
  userId: string,
  filter?: { month?: number; year?: number }
): Promise<number> {
  if (!isSupabaseConfigured()) {
    return DemoStore.getTotalSavings(userId, filter);
  }

  const supabase = createClient();
  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'savings');

  if (filter?.month && filter?.year) {
    const startOfMonth = `${filter.year}-${String(filter.month).padStart(2, '0')}-01`;
    const lastDay = new Date(filter.year, filter.month, 0).getDate();
    const endOfMonth = `${filter.year}-${String(filter.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    query = query.gte('transaction_date', startOfMonth).lte('transaction_date', endOfMonth);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching total savings:', error);
    return 0;
  }

  return (data || []).reduce((sum, t) => sum + Number(t.amount), 0);
}

// ─── Create a new savings goal ────────────────────────────────────────────────
export async function createSavingsGoal(
  userId: string,
  data: {
    name: string;
    target_amount: number;
    deadline?: string;
  }
): Promise<{ success: boolean; goal?: SavingsGoal; error?: string }> {
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Nama target tabungan wajib diisi.' };
  }
  if (!data.target_amount || isNaN(data.target_amount) || data.target_amount <= 0) {
    return { success: false, error: 'Target nominal harus lebih besar dari 0.' };
  }

  if (!isSupabaseConfigured()) {
    const goal = DemoStore.addSavingsGoal(userId, data.name.trim(), Number(data.target_amount), data.deadline);
    return { success: true, goal };
  }

  const supabase = createClient();
  const { data: created, error } = await supabase
    .from('savings_goals')
    .insert({
      user_id: userId,
      name: data.name.trim(),
      target_amount: Number(data.target_amount),
      current_amount: 0,
      deadline: data.deadline || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, goal: created as SavingsGoal };
}

// ─── Update an existing savings goal ─────────────────────────────────────────
export async function updateSavingsGoal(
  userId: string,
  id: string,
  data: {
    name: string;
    target_amount: number;
    deadline?: string;
  }
): Promise<{ success: boolean; goal?: SavingsGoal; error?: string }> {
  if (!data.name || !data.name.trim()) {
    return { success: false, error: 'Nama target tabungan wajib diisi.' };
  }
  if (!data.target_amount || isNaN(data.target_amount) || data.target_amount <= 0) {
    return { success: false, error: 'Target nominal harus lebih besar dari 0.' };
  }

  if (!isSupabaseConfigured()) {
    const updated = DemoStore.updateSavingsGoal(userId, id, data.name.trim(), Number(data.target_amount), data.deadline);
    if (!updated) return { success: false, error: 'Target tabungan tidak ditemukan.' };
    return { success: true, goal: updated };
  }

  const supabase = createClient();
  const { data: updated, error } = await supabase
    .from('savings_goals')
    .update({
      name: data.name.trim(),
      target_amount: Number(data.target_amount),
      deadline: data.deadline || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, goal: updated as SavingsGoal };
}

// ─── Delete a savings goal ────────────────────────────────────────────────────
// The related savings_transactions will have savings_goal_id SET NULL (not deleted).
// This ensures the user's savings balance is preserved.
export async function deleteSavingsGoal(
  userId: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    DemoStore.deleteSavingsGoal(userId, id);
    return { success: true };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ─── Fetch savings history for a specific goal or all deposits ───────────────
export async function fetchSavingsHistory(
  userId: string,
  savingsGoalId?: string | null
): Promise<SavingsTransaction[]> {
  if (!isSupabaseConfigured()) {
    return DemoStore.getSavingsHistory(userId, savingsGoalId);
  }

  const supabase = createClient();
  let query = supabase
    .from('savings_transactions')
    .select('*, savings_goals(name)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });

  if (savingsGoalId) {
    query = query.eq('savings_goal_id', savingsGoalId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching savings history:', error);
    return [];
  }

  return data as SavingsTransaction[];
}

// ─── Add a deposit to savings ─────────────────────────────────────────────────
// Records only in savings_transactions (NOT in the transactions table anymore).
// savingsGoalId can be a goal ID or null (general/unallocated savings).
export async function addSavingsDeposit(
  userId: string,
  savingsGoalId: string | null,
  amount: number,
  transactionDate: string,
  notes?: string
): Promise<{ success: boolean; goal?: SavingsGoal; error?: string }> {
  if (!amount || isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Nominal setoran tabungan harus lebih besar dari 0.' };
  }
  if (!transactionDate) {
    return { success: false, error: 'Tanggal setoran wajib diisi.' };
  }

  if (!isSupabaseConfigured()) {
    const res = DemoStore.addSavingsDeposit(userId, savingsGoalId, Number(amount), transactionDate, notes);
    return { success: true, goal: res.goal || undefined };
  }

  const supabase = createClient();

  // If linked to a target, fetch the goal first
  let targetGoal: SavingsGoal | null = null;
  if (savingsGoalId) {
    const { data: goal, error: goalErr } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', savingsGoalId)
      .eq('user_id', userId)
      .single();

    if (goalErr || !goal) {
      return { success: false, error: 'Target tabungan tidak ditemukan.' };
    }
    targetGoal = goal as SavingsGoal;
  }

  const txId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined;
  const description = targetGoal ? `Tabungan ${targetGoal.name}` : (notes || 'Tabungan Bebas');

  // 1. Insert into transactions table (type = 'savings', category_id = null)
  const txPayload: Record<string, unknown> = {
    user_id: userId,
    category_id: null,
    type: 'savings',
    description,
    amount: Number(amount),
    transaction_date: transactionDate,
    notes: notes || null,
  };
  if (txId) txPayload.id = txId;

  const { data: createdTx, error: txErr } = await supabase
    .from('transactions')
    .insert(txPayload)
    .select('id')
    .single();

  if (txErr) {
    return { success: false, error: txErr.message };
  }

  const generatedId = createdTx?.id || txId;

  // 2. Insert into savings_transactions with matching ID
  const stPayload: Record<string, unknown> = {
    user_id: userId,
    savings_goal_id: savingsGoalId || null,
    amount: Number(amount),
    transaction_date: transactionDate,
    notes: notes || null,
  };
  if (generatedId) stPayload.id = generatedId;

  const { error: stErr } = await supabase.from('savings_transactions').insert(stPayload);

  if (stErr) {
    console.error('Error inserting savings_transactions:', stErr);
  }

  // 3. If linked to a target, update savings goal current_amount
  let updatedGoal: SavingsGoal | undefined = undefined;
  if (targetGoal && savingsGoalId) {
    const newCurrentAmount = Number(targetGoal.current_amount) + Number(amount);
    const { data: updated, error: updateErr } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newCurrentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', savingsGoalId)
      .select()
      .single();

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }
    updatedGoal = updated as SavingsGoal;
  }

  return {
    success: true,
    goal: updatedGoal,
  };
}

