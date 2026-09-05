export type TransactionType = 'expense' | 'income' | 'savings';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation for display
  categories?: {
    name: string;
    type: TransactionType;
  } | null;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface SavingsTransaction {
  id: string;
  user_id: string;
  savings_goal_id: string;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  notes?: string | null;
  created_at: string;
  // Joined relation
  savings_goals?: {
    name: string;
  } | null;
}

export interface MonthlyFinancialSummary {
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  balance: number; // Sisa = Total Income - Total Expense - Total Savings
  transactionCount: number;
  largestExpense?: { description: string; amount: number; categoryName: string } | null;
  largestIncome?: { description: string; amount: number; categoryName: string } | null;
  topExpenseCategory?: { name: string; amount: number } | null;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color?: string;
}

export interface DailyExpense {
  date: string; // YYYY-MM-DD or DD
  dayNumber: number;
  expense: number;
  income: number;
}
