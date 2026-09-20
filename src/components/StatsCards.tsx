import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface StatsCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  prevIncome: number;
  prevExpense: number;
  budgetAmount: number;
  onOpenBudgetModal: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  totalIncome,
  totalExpense,
  balance,
  savingsRate,
  prevIncome,
  prevExpense,
  budgetAmount,
  onOpenBudgetModal,
}) => {
  // Calculate month-over-month differences
  const incomeDiff = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseDiff = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;

  // Budget calculations
  const budgetUsedPercent = budgetAmount > 0 ? Math.min(Math.round((totalExpense / budgetAmount) * 100), 100) : 0;
  const budgetOverPercent = budgetAmount > 0 && totalExpense > budgetAmount
    ? Math.round(((totalExpense - budgetAmount) / budgetAmount) * 100)
    : 0;
  const budgetRemaining = Math.max(0, budgetAmount - totalExpense);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng Thu Nhập */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Thu Nhập</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          {formatCurrency(totalIncome)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {prevIncome > 0 ? (
            <>
              {incomeDiff >= 0 ? (
                <span className="inline-flex items-center text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{incomeDiff.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-500 font-medium">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{incomeDiff.toFixed(1)}%
                </span>
              )}
              <span className="text-slate-400">so với tháng trước</span>
            </>
          ) : (
            <span className="text-slate-400">Chưa có số liệu tháng trước</span>
          )}
        </div>
      </div>

      {/* 2. Tổng Chi Tiêu */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Chi Tiêu</span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">
          {formatCurrency(totalExpense)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {prevExpense > 0 ? (
            <>
              {expenseDiff > 0 ? (
                <span className="inline-flex items-center text-rose-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{expenseDiff.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center text-emerald-600 font-medium">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />{expenseDiff.toFixed(1)}%
                </span>
              )}
              <span className="text-slate-400">so với tháng trước</span>
            </>
          ) : (
            <span className="text-slate-400">Chưa có số liệu tháng trước</span>
          )}
        </div>
      </div>

      {/* 3. Số Dư Còn Lại */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Số Dư Còn Lại</span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
          }`}>
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl font-extrabold tracking-tight mb-1.5 ${
          balance >= 0 ? 'text-indigo-600' : 'text-rose-600'
        }`}>
          {formatCurrency(balance)}
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {totalIncome > 0 ? (
            <span className="text-slate-600 font-medium">
              Tỷ lệ tiết kiệm: <span className={savingsRate >= 20 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>{savingsRate}%</span>
            </span>
          ) : (
            <span className="text-slate-400">Tỷ lệ tiết kiệm: 0%</span>
          )}
        </div>
      </div>

      {/* 4. Hạn Mức Ngân Sách */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hạn Mức Chi Tiêu</span>
            <button
              id="btn-edit-budget-card"
              onClick={onOpenBudgetModal}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <PiggyBank className="w-3.5 h-3.5" />
              <span>{budgetAmount > 0 ? 'Chỉnh sửa' : 'Thiết lập'}</span>
            </button>
          </div>

          {budgetAmount > 0 ? (
            <>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(budgetAmount)}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {totalExpense > budgetAmount ? (
                    <span className="text-rose-600 font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Vượt {budgetOverPercent}%
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Còn {formatCurrency(budgetRemaining)}
                    </span>
                  )}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalExpense > budgetAmount
                      ? 'bg-rose-500'
                      : budgetUsedPercent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((totalExpense / budgetAmount) * 100))}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Đã dùng {Math.round((totalExpense / budgetAmount) * 100)}% ngân sách</span>
              </div>
            </>
          ) : (
            <div className="py-2">
              <p className="text-xs text-slate-500 mb-2">
                Chưa đặt hạn mức chi tiêu cho tháng này.
              </p>
              <button
                onClick={onOpenBudgetModal}
                className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-2.5 py-1.5 rounded-lg transition-colors inline-block"
              >
                + Đặt hạn mức chi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
