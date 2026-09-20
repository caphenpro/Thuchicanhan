import { Transaction, MonthBudget } from '../types';
import { getCurrentMonthKey, shiftMonthKey } from '../utils/formatters';

const TRANSACTIONS_STORAGE_KEY = 'quanlythuchi_transactions_v1';
const BUDGETS_STORAGE_KEY = 'quanlythuchi_budgets_v1';

export function generateSampleTransactions(): Transaction[] {
  const currentMonthKey = getCurrentMonthKey();
  const prevMonthKey = shiftMonthKey(currentMonthKey, -1);

  const [currY, currM] = currentMonthKey.split('-');
  const [prevY, prevM] = prevMonthKey.split('-');

  const txs: Transaction[] = [
    // Current Month Income
    {
      id: 'sample_tx_1',
      type: 'income',
      amount: 22000000,
      categoryId: 'salary',
      walletId: 'wallet_bank',
      date: `${currY}-${currM}-05`,
      note: 'Nhận lương công ty chuyển khoản',
      createdAt: Date.now() - 14 * 86400000,
    },
    {
      id: 'sample_tx_2',
      type: 'income',
      amount: 4500000,
      categoryId: 'freelance',
      walletId: 'wallet_bank',
      date: `${currY}-${currM}-12`,
      note: 'Dự án thiết kế website phụ',
      createdAt: Date.now() - 7 * 86400000,
    },
    {
      id: 'sample_tx_3',
      type: 'income',
      amount: 1200000,
      categoryId: 'investment',
      walletId: 'wallet_bank',
      date: `${currY}-${currM}-15`,
      note: 'Lãi gửi tiết kiệm ngân hàng',
      createdAt: Date.now() - 4 * 86400000,
    },

    // Current Month Expenses
    {
      id: 'sample_tx_4',
      type: 'expense',
      amount: 5500000,
      categoryId: 'housing',
      walletId: 'wallet_bank',
      date: `${currY}-${currM}-05`,
      note: 'Tiền thuê nhà & phí dịch vụ chung cư',
      createdAt: Date.now() - 14 * 86400000,
    },
    {
      id: 'sample_tx_5',
      type: 'expense',
      amount: 850000,
      categoryId: 'housing',
      walletId: 'wallet_momo',
      date: `${currY}-${currM}-07`,
      note: 'Hóa đơn điện nước & Internet wifi',
      createdAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'sample_tx_6',
      type: 'expense',
      amount: 1450000,
      categoryId: 'food',
      walletId: 'wallet_credit',
      date: `${currY}-${currM}-08`,
      note: 'Đi siêu thị WinMart mua thực phẩm tuần',
      createdAt: Date.now() - 11 * 86400000,
    },
    {
      id: 'sample_tx_7',
      type: 'expense',
      amount: 250000,
      categoryId: 'food',
      walletId: 'wallet_cash',
      date: `${currY}-${currM}-09`,
      note: 'Cà phê gặp gỡ bạn bè sáng cuối tuần',
      createdAt: Date.now() - 10 * 86400000,
    },
    {
      id: 'sample_tx_8',
      type: 'expense',
      amount: 500000,
      categoryId: 'transport',
      walletId: 'wallet_bank',
      date: `${currY}-${currM}-10`,
      note: 'Đổ xăng ô tô / xe máy',
      createdAt: Date.now() - 9 * 86400000,
    },
    {
      id: 'sample_tx_9',
      type: 'expense',
      amount: 1200000,
      categoryId: 'shopping',
      walletId: 'wallet_credit',
      date: `${currY}-${currM}-12`,
      note: 'Mua quần áo công sở mới',
      createdAt: Date.now() - 7 * 86400000,
    },
    {
      id: 'sample_tx_10',
      type: 'expense',
      amount: 650000,
      categoryId: 'entertainment',
      walletId: 'wallet_momo',
      date: `${currY}-${currM}-14`,
      note: 'Xem phim rạp CGV & ăn tối',
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'sample_tx_11',
      type: 'expense',
      amount: 420000,
      categoryId: 'health',
      walletId: 'wallet_cash',
      date: `${currY}-${currM}-16`,
      note: 'Mua vitamin C và thực phẩm bổ sung',
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'sample_tx_12',
      type: 'expense',
      amount: 890000,
      categoryId: 'education',
      walletId: 'wallet_bank',
      date: `${currY}-${currM}-17`,
      note: 'Mua sách phát triển bản thân & khóa học online',
      createdAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'sample_tx_13',
      type: 'expense',
      amount: 380000,
      categoryId: 'food',
      walletId: 'wallet_momo',
      date: `${currY}-${currM}-18`,
      note: 'Ăn trưa và trà sữa đồng nghiệp',
      createdAt: Date.now() - 1 * 86400000,
    },

    // Previous Month Transactions for Month-over-Month Comparisons
    {
      id: 'sample_tx_prev_1',
      type: 'income',
      amount: 22000000,
      categoryId: 'salary',
      walletId: 'wallet_bank',
      date: `${prevY}-${prevM}-05`,
      note: 'Lương tháng trước',
      createdAt: Date.now() - 40 * 86400000,
    },
    {
      id: 'sample_tx_prev_2',
      type: 'income',
      amount: 3000000,
      categoryId: 'bonus',
      walletId: 'wallet_bank',
      date: `${prevY}-${prevM}-20`,
      note: 'Thưởng hiệu quả công việc',
      createdAt: Date.now() - 25 * 86400000,
    },
    {
      id: 'sample_tx_prev_3',
      type: 'expense',
      amount: 5500000,
      categoryId: 'housing',
      walletId: 'wallet_bank',
      date: `${prevY}-${prevM}-05`,
      note: 'Tiền thuê nhà tháng trước',
      createdAt: Date.now() - 40 * 86400000,
    },
    {
      id: 'sample_tx_prev_4',
      type: 'expense',
      amount: 3200000,
      categoryId: 'food',
      walletId: 'wallet_credit',
      date: `${prevY}-${prevM}-15`,
      note: 'Tổng chi ăn uống tháng trước',
      createdAt: Date.now() - 30 * 86400000,
    },
    {
      id: 'sample_tx_prev_5',
      type: 'expense',
      amount: 1800000,
      categoryId: 'shopping',
      walletId: 'wallet_credit',
      date: `${prevY}-${prevM}-22`,
      note: 'Mua sắm gia dụng',
      createdAt: Date.now() - 23 * 86400000,
    },
  ];

  return txs;
}

export function generateSampleBudgets(): MonthBudget[] {
  const currentMonth = getCurrentMonthKey();
  const prevMonth = shiftMonthKey(currentMonth, -1);
  return [
    { monthKey: currentMonth, amount: 16000000 },
    { monthKey: prevMonth, amount: 15000000 },
  ];
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) {
      const sample = generateSampleTransactions();
      saveTransactions(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : generateSampleTransactions();
  } catch (err) {
    console.error('Failed to load transactions from localStorage', err);
    return generateSampleTransactions();
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions to localStorage', err);
  }
}

export function loadBudgets(): MonthBudget[] {
  try {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (!raw) {
      const sample = generateSampleBudgets();
      saveBudgets(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : generateSampleBudgets();
  } catch (err) {
    console.error('Failed to load budgets from localStorage', err);
    return generateSampleBudgets();
  }
}

export function saveBudgets(budgets: MonthBudget[]): void {
  try {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets to localStorage', err);
  }
}
