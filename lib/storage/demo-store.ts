import { Category, Transaction, SavingsGoal, SavingsTransaction } from '@/lib/types';

const STORAGE_KEYS = {
  USER: 'pet_demo_user',
  CATEGORIES: 'pet_demo_categories',
  TRANSACTIONS: 'pet_demo_transactions',
  SAVINGS_GOALS: 'pet_demo_savings_goals',
  SAVINGS_TRANSACTIONS: 'pet_demo_savings_transactions',
};

const DEFAULT_CATEGORIES: Array<{ name: string; type: 'expense' | 'income' | 'savings' }> = [
  // Pengeluaran
  { name: 'Makanan', type: 'expense' },
  { name: 'Transportasi', type: 'expense' },
  { name: 'Belanja', type: 'expense' },
  { name: 'Pendidikan', type: 'expense' },
  { name: 'Hiburan', type: 'expense' },
  { name: 'Tagihan', type: 'expense' },
  { name: 'Internet/Pulsa', type: 'expense' },
  { name: 'Kesehatan', type: 'expense' },
  { name: 'Kebutuhan Pribadi', type: 'expense' },
  { name: 'Lainnya', type: 'expense' },
  // Pemasukan
  { name: 'Uang Bulanan', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Bonus', type: 'income' },
  { name: 'Hadiah', type: 'income' },
  { name: 'Lainnya', type: 'income' },
];

export const DemoStore = {
  // Session & User
  getUser(): { id: string; email: string; full_name: string } | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (data) return JSON.parse(data);
    // Return demo user if not logged out
    const demoUser = {
      id: 'demo-user-123',
      email: 'user@example.com',
      full_name: 'Budi Santoso',
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    return demoUser;
  },

  setUser(user: { id: string; email: string; full_name: string } | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      this.ensureDefaultCategories(user.id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  ensureDefaultCategories(userId: string): Category[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    let categories: Category[] = data ? JSON.parse(data) : [];
    
    // Filter categories belonging to userId
    const userCategories = categories.filter(c => c.user_id === userId);
    if (userCategories.length === 0) {
      const now = new Date().toISOString();
      const newDefaults: Category[] = DEFAULT_CATEGORIES.map(cat => ({
        id: 'cat-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        name: cat.name,
        type: cat.type,
        is_default: true,
        created_at: now,
        updated_at: now,
      }));
      categories = [...categories, ...newDefaults];
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      return newDefaults;
    }

    return userCategories;
  },

  // Categories CRUD
  getCategories(userId: string): Category[] {
    return this.ensureDefaultCategories(userId).filter(
      c => c.type !== 'savings' && !c.name.toLowerCase().includes('tabungan')
    );
  },

  addCategory(userId: string, name: string, type: 'expense' | 'income' | 'savings'): Category {
    this.getCategories(userId);
    const now = new Date().toISOString();
    const newCat: Category = {
      id: 'cat-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      name,
      type,
      is_default: false,
      created_at: now,
      updated_at: now,
    };
    const all = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]') : [];
    all.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(all));
    return newCat;
  },

  updateCategory(userId: string, id: string, name: string): Category | null {
    if (typeof window === 'undefined') return null;
    const all: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const index = all.findIndex(c => c.id === id && c.user_id === userId);
    if (index === -1) return null;
    all[index].name = name;
    all[index].updated_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(all));
    return all[index];
  },

  deleteCategory(userId: string, id: string): { success: boolean; error?: string } {
    if (typeof window === 'undefined') return { success: false, error: 'Window undefined' };
    const allTxs: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const isUsed = allTxs.some(t => t.category_id === id && t.user_id === userId);
    if (isUsed) {
      return { success: false, error: 'Kategori tidak dapat dihapus karena masih digunakan oleh transaksi.' };
    }

    const allCats: Category[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES) || '[]');
    const filtered = allCats.filter(c => !(c.id === id && c.user_id === userId));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    return { success: true };
  },

  // Transactions CRUD
  getTransactions(userId: string): Transaction[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const all: Transaction[] = data ? JSON.parse(data) : [];
    const categories = this.getCategories(userId);

    // Map category details
    return all
      .filter(t => t.user_id === userId)
      .map(t => {
        const cat = categories.find(c => c.id === t.category_id);
        return {
          ...t,
          categories: cat ? { name: cat.name, type: cat.type } : null,
        };
      })
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  },

  addTransaction(userId: string, data: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id?: string }): Transaction {
    const all: Transaction[] = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]') : [];
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...data,
      id: data.id || ('tx-' + Math.random().toString(36).substr(2, 9)),
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    all.push(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(all));

    const categories = this.getCategories(userId);
    const cat = categories.find(c => c.id === newTx.category_id);
    return {
      ...newTx,
      categories: cat ? { name: cat.name, type: cat.type } : null,
    };
  },

  updateTransaction(userId: string, id: string, data: Partial<Transaction>): Transaction | null {
    if (typeof window === 'undefined') return null;
    const all: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const index = all.findIndex(t => t.id === id && t.user_id === userId);
    if (index === -1) return null;

    const oldTx = all[index];
    const newAmount = data.amount !== undefined ? Number(data.amount) : oldTx.amount;
    const diff = newAmount - oldTx.amount;

    all[index] = {
      ...all[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(all));

    // If transaction is of type 'savings', synchronize savings_transactions and target
    if (oldTx.type === 'savings' || data.type === 'savings') {
      const allST: SavingsTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS) || '[]');
      const stIndex = allST.findIndex(st => st.id === id && st.user_id === userId);
      if (stIndex !== -1) {
        const goalId = allST[stIndex].savings_goal_id;
        allST[stIndex] = {
          ...allST[stIndex],
          amount: newAmount,
          transaction_date: data.transaction_date || allST[stIndex].transaction_date,
          notes: data.notes !== undefined ? (data.notes || null) : allST[stIndex].notes,
        };
        localStorage.setItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS, JSON.stringify(allST));

        // Adjust target current_amount with difference
        if (goalId && diff !== 0) {
          const allGoals: SavingsGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]');
          const gIndex = allGoals.findIndex(g => g.id === goalId && g.user_id === userId);
          if (gIndex !== -1) {
            allGoals[gIndex].current_amount = Math.max(0, allGoals[gIndex].current_amount + diff);
            allGoals[gIndex].updated_at = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(allGoals));
          }
        }
      }
    }

    const categories = this.getCategories(userId);
    const cat = categories.find(c => c.id === all[index].category_id);
    return {
      ...all[index],
      categories: cat ? { name: cat.name, type: cat.type } : null,
    };
  },

  deleteTransaction(userId: string, id: string): boolean {
    if (typeof window === 'undefined') return false;
    const all: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const tx = all.find(t => t.id === id && t.user_id === userId);
    if (!tx) return false;

    // If transaction is of type 'savings', adjust target current_amount and remove savings_transactions record
    if (tx.type === 'savings') {
      const allST: SavingsTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS) || '[]');
      const stIndex = allST.findIndex(st => st.id === id && st.user_id === userId);
      if (stIndex !== -1) {
        const goalId = allST[stIndex].savings_goal_id;
        if (goalId) {
          const allGoals: SavingsGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]');
          const gIndex = allGoals.findIndex(g => g.id === goalId && g.user_id === userId);
          if (gIndex !== -1) {
            allGoals[gIndex].current_amount = Math.max(0, allGoals[gIndex].current_amount - tx.amount);
            allGoals[gIndex].updated_at = new Date().toISOString();
            localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(allGoals));
          }
        }
        const filteredST = allST.filter(st => !(st.id === id && st.user_id === userId));
        localStorage.setItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS, JSON.stringify(filteredST));
      }
    }

    const filtered = all.filter(t => !(t.id === id && t.user_id === userId));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filtered));
    return true;
  },

  // Savings Goals CRUD
  getSavingsGoals(userId: string): SavingsGoal[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS);
    const all: SavingsGoal[] = data ? JSON.parse(data) : [];
    return all.filter(g => g.user_id === userId);
  },

  addSavingsGoal(userId: string, name: string, target_amount: number, deadline?: string): SavingsGoal {
    const all: SavingsGoal[] = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]') : [];
    const now = new Date().toISOString();
    const newGoal: SavingsGoal = {
      id: 'goal-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      name,
      target_amount,
      current_amount: 0,
      deadline: deadline || null,
      created_at: now,
      updated_at: now,
    };
    all.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(all));
    return newGoal;
  },

  updateSavingsGoal(userId: string, id: string, name: string, target_amount: number, deadline?: string): SavingsGoal | null {
    if (typeof window === 'undefined') return null;
    const all: SavingsGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]');
    const index = all.findIndex(g => g.id === id && g.user_id === userId);
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      name,
      target_amount,
      deadline: deadline || null,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(all));
    return all[index];
  },

  deleteSavingsGoal(userId: string, id: string): boolean {
    if (typeof window === 'undefined') return false;
    const all: SavingsGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]');
    const filtered = all.filter(g => !(g.id === id && g.user_id === userId));
    localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(filtered));

    // ON DELETE SET NULL: Disassociate savings transactions instead of deleting them
    // This preserves user's total savings even when target is deleted
    const allST: SavingsTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS) || '[]');
    const updatedST = allST.map(st => {
      if (st.user_id === userId && st.savings_goal_id === id) {
        return { ...st, savings_goal_id: null };
      }
      return st;
    });
    localStorage.setItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS, JSON.stringify(updatedST));

    return true;
  },

  // Total savings = sum of all active savings transactions for user
  getTotalSavings(userId: string, filter?: { month?: number; year?: number }): number {
    if (typeof window === 'undefined') return 0;
    const allTx: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    return allTx
      .filter(t => {
        if (t.user_id !== userId || t.type !== 'savings') return false;
        if (filter?.month && filter?.year) {
          const dStr = t.transaction_date.substring(0, 10);
          const [y, m] = dStr.split('-').map(Number);
          return y === filter.year && m === filter.month;
        }
        return true;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  },

  addSavingsDeposit(
    userId: string,
    savingsGoalId: string | null,
    amount: number,
    transactionDate: string,
    notes?: string
  ): { goal: SavingsGoal | null } {
    let updatedGoal: SavingsGoal | null = null;
    const txId = 'stx-' + Math.random().toString(36).substr(2, 9);

    const goals = this.getSavingsGoals(userId);
    const goal = savingsGoalId ? goals.find(g => g.id === savingsGoalId) : null;
    const goalName = goal ? goal.name : 'Tabungan';

    // 1. If linked to a goal, update Savings Goal current_amount
    if (savingsGoalId && typeof window !== 'undefined') {
      const allGoals: SavingsGoal[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_GOALS) || '[]');
      const gIndex = allGoals.findIndex(g => g.id === savingsGoalId && g.user_id === userId);
      if (gIndex !== -1) {
        allGoals[gIndex].current_amount += amount;
        allGoals[gIndex].updated_at = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(allGoals));
        updatedGoal = allGoals[gIndex];
      }
    }

    // 2. Add to transactions table (type = 'savings', category_id = null)
    this.addTransaction(userId, {
      id: txId,
      category_id: null,
      type: 'savings',
      description: goal ? `Tabungan ${goalName}` : (notes || 'Tabungan Bebas'),
      amount,
      transaction_date: transactionDate,
      notes: notes || null,
    });

    // 3. Record savings transaction entry with matching ID
    if (typeof window !== 'undefined') {
      const allST: SavingsTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS) || '[]');
      allST.push({
        id: txId,
        user_id: userId,
        savings_goal_id: savingsGoalId || null,
        amount,
        transaction_date: transactionDate,
        notes: notes || null,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS, JSON.stringify(allST));
    }

    return { goal: updatedGoal };
  },

  getSavingsHistory(userId: string, savingsGoalId?: string | null): SavingsTransaction[] {
    if (typeof window === 'undefined') return [];
    const allST: SavingsTransaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVINGS_TRANSACTIONS) || '[]');
    return allST
      .filter(st => st.user_id === userId && (!savingsGoalId || st.savings_goal_id === savingsGoalId))
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  },
};

