import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Wallet,
  PiggyBank,
  RotateCcw,
  Download,
  MoreVertical,
} from 'lucide-react';
import { formatMonthLabel, getCurrentMonthKey, shiftMonthKey } from '../utils/formatters';

interface HeaderProps {
  currentMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
  onOpenAddModal: () => void;
  onOpenBudgetModal: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onSelectMonth,
  onOpenAddModal,
  onOpenBudgetModal,
  onResetData,
  onExportData,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isCurrentMonth = currentMonthKey === getCurrentMonthKey();

  const handlePrevMonth = () => {
    onSelectMonth(shiftMonthKey(currentMonthKey, -1));
  };

  const handleNextMonth = () => {
    onSelectMonth(shiftMonthKey(currentMonthKey, 1));
  };

  const handleGoToday = () => {
    onSelectMonth(getCurrentMonthKey());
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 gap-3">
          {/* Logo and Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Sổ Thu Chi Cá Nhân
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Quản lý dòng tiền & Thống kê biểu đồ trực quan
                </p>
              </div>
            </div>

            {/* Mobile Actions Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                id="btn-header-mobile-add"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Ghi chép</span>
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex items-center justify-between sm:justify-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-center sm:self-auto w-full sm:w-auto">
            <button
              id="btn-prev-month"
              onClick={handlePrevMonth}
              title="Tháng trước"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800 min-w-[130px] text-center">
                {formatMonthLabel(currentMonthKey)}
              </span>
            </div>

            <button
              id="btn-next-month"
              onClick={handleNextMonth}
              title="Tháng sau"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentMonth && (
              <button
                id="btn-jump-today"
                onClick={handleGoToday}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 transition-colors ml-1"
              >
                Hôm nay
              </button>
            )}
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              id="btn-header-budget"
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            >
              <PiggyBank className="w-4 h-4 text-amber-500" />
              <span>Hạn mức chi</span>
            </button>

            <button
              id="btn-header-add"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-200 transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm giao dịch</span>
            </button>

            {/* Menu Options */}
            <div className="relative">
              <button
                id="btn-header-more-options"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                title="Tùy chọn"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40"
                  onClick={() => setShowMenu(false)}
                >
                  <button
                    id="btn-menu-export"
                    onClick={onExportData}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xuất dữ liệu (JSON)</span>
                  </button>
                  <button
                    id="btn-menu-reset"
                    onClick={onResetData}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span>Khôi phục dữ liệu mẫu</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
