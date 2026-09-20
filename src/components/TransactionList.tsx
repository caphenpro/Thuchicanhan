import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Plus,
  Receipt,
  Wallet as WalletIcon,
  Calendar,
} from 'lucide-react';
import { Transaction, Category, Wallet, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDateVietnamese } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  wallets,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Maps for fast lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const walletMap = useMemo(() => {
    const map = new Map<string, Wallet>();
    wallets.forEach((w) => map.set(w.id, w));
    return map;
  }, [wallets]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter by type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Filter by category
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

      // Filter by search keyword
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const cat = categoryMap.get(t.categoryId);
        const matchNote = t.note.toLowerCase().includes(term);
        const matchCat = cat?.name.toLowerCase().includes(term);
        const matchAmount = t.amount.toString().includes(term);
        if (!matchNote && !matchCat && !matchAmount) return false;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm, categoryMap]);

  // Group transactions by date, sorted descending by date
  const groupedByDate = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach((t) => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });

    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => {
      const items = groups[date];
      const dayIncome = items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const dayExpense = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        date,
        items,
        dayIncome,
        dayExpense,
      };
    });
  }, [filteredTransactions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* List Header & Filters */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>Sổ Giao Dịch Trong Tháng</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredTransactions.length} giao dịch
              </span>
            </h3>
          </div>

          <button
            id="btn-list-add-tx"
            onClick={onAddTransaction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giao dịch</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="input-search-transactions"
              type="text"
              placeholder="Tìm kiếm theo ghi chú, danh mục, số tiền..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-medium shrink-0">
            <button
              id="filter-type-all"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              id="filter-type-expense"
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chi tiêu
            </button>
            <button
              id="filter-type-income"
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thu nhập
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="shrink-0">
            <select
              id="select-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.type === 'income' ? '[Thu]' : '[Chi]'} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List by Day */}
      <div className="divide-y divide-slate-100">
        {groupedByDate.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy giao dịch nào</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục phía trên.'
                : 'Tháng này chưa có giao dịch nào được ghi nhận. Hãy bắt đầu ghi chép ngay!'}
            </p>
            <button
              onClick={onAddTransaction}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi chép giao dịch mới</span>
            </button>
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div key={group.date} className="p-3 sm:p-4 hover:bg-slate-50/40 transition-colors">
              {/* Day Header */}
              <div className="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded-lg text-xs mb-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDateVietnamese(group.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600">
                      +{formatCurrency(group.dayIncome)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600">
                      -{formatCurrency(group.dayExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this day */}
              <div className="space-y-1.5">
                {group.items.map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const wallet = walletMap.get(tx.walletId);
                  const isExpense = tx.type === 'expense';

                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all"
                    >
                      {/* Left: Icon & Description */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: cat?.color || '#64748b' }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {tx.note || cat?.name || 'Giao dịch không tên'}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-medium text-slate-600">{cat?.name}</span>
                            {wallet && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                <WalletIcon className="w-2.5 h-2.5" />
                                {wallet.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-2.5 shrink-0 ml-3">
                        <div className="text-right">
                          <span
                            className={`text-sm font-extrabold tracking-tight block ${
                              isExpense ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {isExpense ? '-' : '+'}
                            {formatCurrency(tx.amount)}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="opacity-80 group-hover:opacity-100 flex items-center gap-1">
                          <button
                            id={`btn-edit-tx-${tx.id}`}
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Sửa giao dịch"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-tx-${tx.id}`}
                            onClick={() => setConfirmDeleteId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa giao dịch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Xác nhận xóa giao dịch?</h4>
            <p className="text-xs text-slate-500 mb-4">
              Hành động này sẽ xóa vĩnh viễn giao dịch khỏi sổ thu chi và cập nhật lại biểu đồ thống kê.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                id="btn-cancel-delete"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                id="btn-confirm-delete"
                onClick={() => {
                  onDeleteTransaction(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
