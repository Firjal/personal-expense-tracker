import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';
import { SavingsGoal, SavingsTransaction, Transaction } from '@/lib/types';
import { createTransaction } from '@/lib/actions/transactions';

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

export async function fetchSavingsHistory(
  userId: string,
  savingsGoalId: string
): Promise<SavingsTransaction[]> {
  if (!isSupabaseConfigured()) {
    // Demo mode: return empty history
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('savings_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('savings_goal_id', savingsGoalId)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Error fetching savings history:', error);
    return [];
  }

  return data as SavingsTransaction[];
}

export async function addSavingsDeposit(
  userId: string,
  savingsGoalId: string,
  amount: number,
  transactionDate: string,
  notes?: string
): Promise<{ success: boolean; goal?: SavingsGoal; transaction?: Transaction; error?: string }> {
  if (!amount || isNaN(amount) || amount <= 0) {
    return { success: false, error: 'Nominal setoran tabungan harus lebih besar dari 0.' };
  }
  if (!transactionDate) {
    return { success: false, error: 'Tanggal setoran wajib diisi.' };
  }

  if (!isSupabaseConfigured()) {
    const res = DemoStore.addSavingsDeposit(userId, savingsGoalId, Number(amount), transactionDate, notes);
    return { success: true, goal: res.goal || undefined, transaction: res.transaction };
  }

  const supabase = createClient();

  // 1. Fetch savings goal details
  const { data: goal, error: goalErr } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('id', savingsGoalId)
    .eq('user_id', userId)
    .single();

  if (goalErr || !goal) {
    return { success: false, error: 'Target tabungan tidak ditemukan.' };
  }

  // Validate: deposit must not exceed remaining target
  const remaining = Number(goal.target_amount) - Number(goal.current_amount);
  if (amount > remaining) {
    return {
      success: false,
      error: `Setoran melebihi sisa target. Maksimal yang bisa ditabung: Rp${remaining.toLocaleString('id-ID')}.`,
    };
  }

  // 2. Find or create savings category
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'savings');

  const savingsCategoryId = categories && categories.length > 0 ? categories[0].id : null;

  // 3. Create transaction record of type 'savings'
  const txRes = await createTransaction(userId, {
    description: `Tabungan ${goal.name}`,
    amount: Number(amount),
    type: 'savings',
    category_id: savingsCategoryId || '',
    transaction_date: transactionDate,
    notes: notes || `Menabung untuk target ${goal.name}`,
  });

  if (!txRes.success) {
    return { success: false, error: txRes.error };
  }

  // 4. Record savings transaction entry
  await supabase.from('savings_transactions').insert({
    user_id: userId,
    savings_goal_id: savingsGoalId,
    amount: Number(amount),
    transaction_date: transactionDate,
    notes: notes || null,
  });

  // 5. Update savings goal current_amount
  const newCurrentAmount = Number(goal.current_amount) + Number(amount);
  const { data: updatedGoal, error: updateErr } = await supabase
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

  return {
    success: true,
    goal: updatedGoal as SavingsGoal,
    transaction: txRes.transaction,
  };
}
