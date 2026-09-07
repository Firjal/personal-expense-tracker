import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';
import { Transaction, TransactionType, MonthlyFinancialSummary } from '@/lib/types';
import { getMonthDateRange } from '@/lib/utils/format';

export interface TransactionFilterOptions {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  type?: TransactionType | 'all';
  categoryId?: string;
  searchQuery?: string;
}

export async function fetchTransactions(
  userId: string,
  options: TransactionFilterOptions = {}
): Promise<Transaction[]> {
  if (!isSupabaseConfigured()) {
    let list = DemoStore.getTransactions(userId);

    // Apply month/year filter if provided
    if (options.month && options.year) {
      const { startDate, endDate } = getMonthDateRange(options.month, options.year);
      list = list.filter(t => t.transaction_date >= startDate && t.transaction_date <= endDate);
    } else {
      if (options.startDate) {
        list = list.filter(t => t.transaction_date >= options.startDate!);
      }
      if (options.endDate) {
        list = list.filter(t => t.transaction_date <= options.endDate!);
      }
    }

    // Filter by type
    if (options.type && options.type !== 'all') {
      list = list.filter(t => t.type === options.type);
    }

    // Filter by category
    if (options.categoryId) {
      list = list.filter(t => t.category_id === options.categoryId);
    }

    // Filter by search query
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(
        t => t.description.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    return list;
  }

  const supabase = createClient();
  let query = supabase
    .from('transactions')
    .select('*, categories(name, type)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (options.month && options.year) {
    const { startDate, endDate } = getMonthDateRange(options.month, options.year);
    query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
  } else {
    if (options.startDate) {
      query = query.gte('transaction_date', options.startDate);
    }
    if (options.endDate) {
      query = query.lte('transaction_date', options.endDate);
    }
  }

  if (options.type && options.type !== 'all') {
    query = query.eq('type', options.type);
  }

  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options.searchQuery && options.searchQuery.trim() !== '') {
    query = query.ilike('description', `%${options.searchQuery.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data as Transaction[];
}

export async function createTransaction(
  userId: string,
  data: {
    description: string;
    amount: number;
    type: TransactionType;
    category_id?: string | null;
    transaction_date: string;
    notes?: string;
  }
): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
  // Validation
  if (!data.description || !data.description.trim()) {
    return { success: false, error: 'Keterangan transaksi wajib diisi.' };
  }
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    return { success: false, error: 'Nominal transaksi harus lebih besar dari 0.' };
  }
  if (!data.transaction_date) {
    return { success: false, error: 'Tanggal transaksi wajib diisi.' };
  }
  if (!data.type) {
    return { success: false, error: 'Tipe transaksi wajib dipilih.' };
  }

  if (!isSupabaseConfigured()) {
    const tx = DemoStore.addTransaction(userId, {
      description: data.description.trim(),
      amount: Number(data.amount),
      type: data.type,
      category_id: data.category_id || null,
      transaction_date: data.transaction_date,
      notes: data.notes?.trim() || null,
    });
    return { success: true, transaction: tx };
  }

  const supabase = createClient();
  const { data: created, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      description: data.description.trim(),
      amount: Number(data.amount),
      type: data.type,
      category_id: data.category_id || null,
      transaction_date: data.transaction_date,
      notes: data.notes?.trim() || null,
    })
    .select('*, categories(name, type)')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, transaction: created as Transaction };
}

export async function updateTransaction(
  userId: string,
  id: string,
  data: {
    description: string;
    amount: number;
    type: TransactionType;
    category_id?: string | null;
    transaction_date: string;
    notes?: string;
  }
): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
  if (!data.description || !data.description.trim()) {
    return { success: false, error: 'Keterangan transaksi wajib diisi.' };
  }
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    return { success: false, error: 'Nominal transaksi harus lebih besar dari 0.' };
  }

  if (!isSupabaseConfigured()) {
    const updated = DemoStore.updateTransaction(userId, id, {
      description: data.description.trim(),
      amount: Number(data.amount),
      type: data.type,
      category_id: data.category_id || null,
      transaction_date: data.transaction_date,
      notes: data.notes?.trim() || null,
    });
    if (!updated) return { success: false, error: 'Transaksi tidak ditemukan.' };
    return { success: true, transaction: updated };
  }

  const supabase = createClient();
  const { data: updated, error } = await supabase
    .from('transactions')
    .update({
      description: data.description.trim(),
      amount: Number(data.amount),
      type: data.type,
      category_id: data.category_id || null,
      transaction_date: data.transaction_date,
      notes: data.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, categories(name, type)')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, transaction: updated as Transaction };
}

export async function deleteTransaction(
  userId: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    DemoStore.deleteTransaction(userId, id);
    return { success: true };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getMonthlySummary(
  userId: string,
  month: number,
  year: number
): Promise<MonthlyFinancialSummary> {
  const transactions = await fetchTransactions(userId, { month, year });

  let totalIncome = 0;
  let totalExpense = 0;

  let largestExpense: { description: string; amount: number; categoryName: string } | null = null;
  let largestIncome: { description: string; amount: number; categoryName: string } | null = null;

  const categoryTotals: Record<string, { name: string; amount: number }> = {};

  transactions.forEach(t => {
    const amt = Number(t.amount);
    const catName = t.categories?.name || 'Tanpa Kategori';

    if (t.type === 'income') {
      totalIncome += amt;
      if (!largestIncome || amt > largestIncome.amount) {
        largestIncome = { description: t.description, amount: amt, categoryName: catName };
      }
    } else if (t.type === 'expense') {
      totalExpense += amt;
      if (!largestExpense || amt > largestExpense.amount) {
        largestExpense = { description: t.description, amount: amt, categoryName: catName };
      }
      // Track expense category
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, amount: 0 };
      }
      categoryTotals[catName].amount += amt;
    }
  });

  // Calculate top expense category
  let topExpenseCategory: { name: string; amount: number } | null = null;
  Object.values(categoryTotals).forEach(cat => {
    if (!topExpenseCategory || cat.amount > topExpenseCategory.amount) {
      topExpenseCategory = { name: cat.name, amount: cat.amount };
    }
  });

  // Balance = Total Income - Total Expense (savings is managed separately)
  const balance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    balance,
    transactionCount: transactions.length,
    largestExpense,
    largestIncome,
    topExpenseCategory,
  };
}

