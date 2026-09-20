export type TransactionType = 'expense' | 'income';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'credit';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
}

export interface MonthBudget {
  monthKey: string; // YYYY-MM
  amount: number;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  dailyAverage: number;
  topCategory: { category: Category; amount: number; percentage: number } | null;
  highestSpendingDay: { date: string; amount: number } | null;
}
