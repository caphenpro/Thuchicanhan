import React, { useState, useEffect } from 'react';
import { X, PiggyBank, Check } from 'lucide-react';
import { formatCurrency, formatMonthLabel } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonthKey: string;
  currentBudgetAmount: number;
  onSaveBudget: (monthKey: string, amount: number) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentMonthKey,
  currentBudgetAmount,
  onSaveBudget,
}) => {
  const [amount, setAmount] = useState<number>(currentBudgetAmount || 15000000);
  const [rawInput, setRawInput] = useState<string>(
    currentBudgetAmount ? currentBudgetAmount.toString() : '15000000'
  );

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudgetAmount || 15000000);
      setRawInput(currentBudgetAmount ? currentBudgetAmount.toString() : '15000000');
    }
  }, [isOpen, currentBudgetAmount]);

  if (!isOpen) return null;

  const quickPresets = [
    { label: '8 triệu', value: 8000000 },
    { label: '12 triệu', value: 12000000 },
    { label: '15 triệu', value: 15000000 },
    { label: '20 triệu', value: 20000000 },
    { label: '30 triệu', value: 30000000 },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    setAmount(num);
    setRawInput(rawVal);
  };

  const handlePreset = (val: number) => {
    setAmount(val);
    setRawInput(val.toString());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget(currentMonthKey, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Hạn Mức Chi Tiêu Tháng
              </h3>
              <p className="text-[11px] text-slate-500">
                {formatMonthLabel(currentMonthKey)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Số tiền hạn mức tối đa (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={rawInput ? Number(rawInput).toLocaleString('vi-VN') : ''}
                onChange={handleInputChange}
                className="w-full text-xl font-extrabold text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 pr-10"
                placeholder="15.000.000"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ₫
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Gợi ý nhanh
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.value}
                  onClick={() => handlePreset(preset.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    amount === preset.value
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            💡 <strong>Mẹo tài chính:</strong> Đặt hạn mức chi tiêu giúp bạn kiểm soát ngân sách, ngăn ngừa bội chi và duy trì tỷ lệ tiết kiệm tối thiểu 20% mỗi tháng.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu hạn mức</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
