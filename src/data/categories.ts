import { Category, Wallet } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Chi tiêu (Expenses)
  {
    id: 'food',
    name: 'Ăn uống & Cà phê',
    type: 'expense',
    icon: 'Utensils',
    color: '#f97316', // Orange
  },
  {
    id: 'transport',
    name: 'Đi lại & Xăng xe',
    type: 'expense',
    icon: 'Car',
    color: '#3b82f6', // Blue
  },
  {
    id: 'housing',
    name: 'Nhà cửa & Hóa đơn',
    type: 'expense',
    icon: 'Home',
    color: '#8b5cf6', // Purple
  },
  {
    id: 'shopping',
    name: 'Mua sắm & Tiêu dùng',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899', // Pink
  },
  {
    id: 'entertainment',
    name: 'Giải trí & Du lịch',
    type: 'expense',
    icon: 'Gamepad2',
    color: '#06b6d4', // Cyan
  },
  {
    id: 'health',
    name: 'Y tế & Sức khỏe',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ef4444', // Red
  },
  {
    id: 'education',
    name: 'Giáo dục & Học tập',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#10b981', // Emerald
  },
  {
    id: 'family',
    name: 'Gia đình & Con cái',
    type: 'expense',
    icon: 'Users',
    color: '#eab308', // Amber
  },
  {
    id: 'other_expense',
    name: 'Chi tiêu khác',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b', // Slate
  },

  // Thu nhập (Incomes)
  {
    id: 'salary',
    name: 'Lương cố định',
    type: 'income',
    icon: 'Banknote',
    color: '#10b981', // Emerald
  },
  {
    id: 'bonus',
    name: 'Thưởng & Làm thêm',
    type: 'income',
    icon: 'Gift',
    color: '#f59e0b', // Amber
  },
  {
    id: 'investment',
    name: 'Đầu tư & Cổ tức',
    type: 'income',
    icon: 'TrendingUp',
    color: '#3b82f6', // Blue
  },
  {
    id: 'freelance',
    name: 'Kinh doanh & Nghề tay trái',
    type: 'income',
    icon: 'Briefcase',
    color: '#8b5cf6', // Purple
  },
  {
    id: 'other_income',
    name: 'Thu nhập khác',
    type: 'income',
    icon: 'Coins',
    color: '#64748b', // Slate
  },
];

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'wallet_cash',
    name: 'Tiền mặt',
    type: 'cash',
    icon: 'Wallet',
    color: '#10b981',
  },
  {
    id: 'wallet_bank',
    name: 'Tài khoản Ngân hàng',
    type: 'bank',
    icon: 'CreditCard',
    color: '#3b82f6',
  },
  {
    id: 'wallet_momo',
    name: 'Ví điện tử (Momo/ZaloPay)',
    type: 'ewallet',
    icon: 'Smartphone',
    color: '#ec4899',
  },
  {
    id: 'wallet_credit',
    name: 'Thẻ tín dụng',
    type: 'credit',
    icon: 'ShieldCheck',
    color: '#f97316',
  },
];
