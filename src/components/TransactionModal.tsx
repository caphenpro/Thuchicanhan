import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight, Calendar, Tag, Wallet as WalletIcon, FileText } from 'lucide-react';
import { Transaction, Category, Wallet, TransactionType } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, getTodayDateStr } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  wallets: Wallet[];
  defaultMonthKey?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  categories,
  wallets,
  defaultMonthKey,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [rawAmountInput, setRawAmountInput] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('wallet_bank');
  const [date, setDate] = useState<string>(getTodayDateStr());
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Prepopulate or reset when opening modal
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount);
      setRawAmountInput(editingTransaction.amount.toString());
      setCategoryId(editingTransaction.categoryId);
      setWalletId(editingTransaction.walletId || 'wallet_bank');
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setType('expense');
      setAmount(0);
      setRawAmountInput('');
      setWalletId('wallet_bank');
      setNote('');
      // Set date to today or 1st day of the selected month
      const today = getTodayDateStr();
      if (defaultMonthKey && !today.startsWith(defaultMonthKey)) {
        setDate(`${defaultMonthKey}-01`);
      } else {
        setDate(today);
      }
      // Set default category for expense
      const firstExp = categories.find((c) => c.type === 'expense');
      if (firstExp) setCategoryId(firstExp.id);
    }
    setError('');
  }, [isOpen, editingTransaction, categories, defaultMonthKey]);

  // When type changes, adjust default category if current category belongs to other type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCategory = categories.find((c) => c.id === categoryId && c.type === newType);
    if (!validCategory) {
      const firstOfType = categories.find((c) => c.type === newType);
      if (firstOfType) setCategoryId(firstOfType.id);
    }
  };

  // Filter categories by chosen type
  const availableCategories = categories.filter((c) => c.type === type);

  // Quick amount additions
  const quickPills = [
    { label: '+50k', value: 50000 },
    { label: '+100k', value: 100000 },
    { label: '+200k', value: 200000 },
    { label: '+500k', value: 500000 },
    { label: '+1 triệu', value: 1000000 },
    { label: '+5 triệu', value: 5000000 },
  ];

  const handleAddQuickAmount = (val: number) => {
    const nextAmount = amount + val;
    setAmount(nextAmount);
    setRawAmountInput(nextAmount.toString());
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    setAmount(num);
    setRawAmountInput(rawVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }
    if (!categoryId) {
      setError('Vui lòng chọn một danh mục.');
      return;
    }
    if (!date) {
      setError('Vui lòng chọn ngày giao dịch.');
      return;
    }

    onSave(
      {
        type,
        amount,
        categoryId,
        walletId,
        date,
        note: note.trim(),
      },
      editingTransaction?.id
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {editingTransaction ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
          </h3>
          <button
            id="btn-close-tx-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Type Selector (Chi Tiêu vs Thu Nhập) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              id="btn-modal-type-expense"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Tiền Chi Tiêu</span>
            </button>
            <button
              type="button"
              id="btn-modal-type-income"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Tiền Thu Nhập</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền (VNĐ) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-tx-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={rawAmountInput ? Number(rawAmountInput).toLocaleString('vi-VN') : ''}
                onChange={handleAmountInputChange}
                className="w-full text-2xl font-extrabold text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-12"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₫
              </span>
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickPills.map((pill) => (
                <button
                  type="button"
                  key={pill.label}
                  onClick={() => handleAddQuickAmount(pill.value)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  {pill.label}
                </button>
              ))}
              {amount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(0);
                    setRawAmountInput('');
                  }}
                  className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                >
                  Xóa số
                </button>
              )}
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Danh mục {type === 'expense' ? 'chi tiêu' : 'thu nhập'}</span>
              <span className="text-[11px] text-slate-400 font-normal">Chọn 1 danh mục</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {availableCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all text-center ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200/70 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={15} />
                    </div>
                    <span className="text-[11px] line-clamp-1 leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet / Payment Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ví / Tài khoản thanh toán
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {wallets.map((w) => (
                <button
                  type="button"
                  key={w.id}
                  onClick={() => setWalletId(w.id)}
                  className={`px-2.5 py-1.5 text-xs rounded-xl border flex items-center gap-1.5 transition-all truncate ${
                    walletId === w.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CategoryIcon name={w.icon} size={14} className="text-slate-500" />
                  <span className="truncate">{w.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Ngày giao dịch</span>
              </label>
              <input
                id="input-tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Ghi chú / Mô tả</span>
              </label>
              <input
                id="input-tx-note"
                type="text"
                placeholder="VD: Cà phê sáng, Mua thức ăn..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="btn-tx-modal-cancel"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              id="btn-tx-modal-submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-200 transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingTransaction ? 'Lưu thay đổi' : 'Lưu giao dịch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
