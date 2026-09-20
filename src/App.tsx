import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { VisualCharts } from './components/VisualCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS } from './data/categories';
import {
  loadTransactions,
  saveTransactions,
  loadBudgets,
  saveBudgets,
  generateSampleTransactions,
  generateSampleBudgets,
} from './data/initialData';
import { Transaction, MonthBudget } from './types';
import { getCurrentMonthKey, shiftMonthKey } from './utils/formatters';
import { CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(() => getCurrentMonthKey());
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [budgets, setBudgets] = useState<MonthBudget[]>(() => loadBudgets());

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync to LocalStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgets(budgets);
  }, [budgets]);

  // Current Month Transactions
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonthKey));
  }, [transactions, selectedMonthKey]);

  // Previous Month Transactions (for comparisons)
  const prevMonthKey = useMemo(() => shiftMonthKey(selectedMonthKey, -1), [selectedMonthKey]);
  const prevMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(prevMonthKey));
  }, [transactions, prevMonthKey]);

  // Financial Summaries for Current Month
  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Summaries for Previous Month
  const prevIncome = useMemo(() => {
    return prevMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTransactions]);

  const prevExpense = useMemo(() => {
    return prevMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [prevMonthTransactions]);

  // Current Month's Budget
  const currentBudget = useMemo(() => {
    return budgets.find((b) => b.monthKey === selectedMonthKey);
  }, [budgets, selectedMonthKey]);

  // CRUD Actions
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      // Update
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? { ...t, ...data } : t))
      );
      showToast('Đã cập nhật giao dịch thành công!');
    } else {
      // Create new
      const newTx: Transaction = {
        ...data,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Đã thêm giao dịch mới vào sổ thu chi!');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Đã xóa giao dịch thành công.');
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTx(null);
    setIsTxModalOpen(true);
  };

  const handleSaveBudget = (monthKey: string, amount: number) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.monthKey === monthKey);
      if (exists) {
        return prev.map((b) => (b.monthKey === monthKey ? { ...b, amount } : b));
      } else {
        return [...prev, { monthKey, amount }];
      }
    });
    showToast('Đã cập nhật hạn mức chi tiêu thành công!');
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục dữ liệu mẫu ban đầu? Tất cả dữ liệu hiện tại sẽ được làm mới.')) {
      const samples = generateSampleTransactions();
      const sampleBudgets = generateSampleBudgets();
      setTransactions(samples);
      setBudgets(sampleBudgets);
      saveTransactions(samples);
      saveBudgets(sampleBudgets);
      showToast('Đã khôi phục dữ liệu mẫu thành công!');
    }
  };

  const handleExportData = () => {
    const exportData = {
      transactions,
      budgets,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quan_ly_thu_chi_${selectedMonthKey}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Đã tải xuống tệp dữ liệu sao lưu!');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        currentMonthKey={selectedMonthKey}
        onSelectMonth={setSelectedMonthKey}
        onOpenAddModal={handleOpenAddModal}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetData={handleResetData}
        onExportData={handleExportData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Key Statistics Cards */}
        <StatsCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          balance={balance}
          savingsRate={savingsRate}
          prevIncome={prevIncome}
          prevExpense={prevExpense}
          budgetAmount={currentBudget?.amount || 0}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Visual Charts (TRỌNG TÂM: Biểu đồ trực quan) */}
        <VisualCharts
          currentMonthKey={selectedMonthKey}
          transactions={currentMonthTransactions}
          allTransactions={transactions}
          categories={DEFAULT_CATEGORIES}
          budget={currentBudget}
        />

        {/* 3. Transaction Log & Filtered Records */}
        <TransactionList
          transactions={currentMonthTransactions}
          categories={DEFAULT_CATEGORIES}
          wallets={DEFAULT_WALLETS}
          onAddTransaction={handleOpenAddModal}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sổ Thu Chi Cá Nhân &copy; {new Date().getFullYear()} - Dữ liệu được lưu an toàn trong trình duyệt của bạn</span>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Biểu đồ trực quan Recharts</span>
            <span>•</span>
            <span>Định dạng tiền tệ VNĐ</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        categories={DEFAULT_CATEGORIES}
        wallets={DEFAULT_WALLETS}
        defaultMonthKey={selectedMonthKey}
      />

      {/* Monthly Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonthKey={selectedMonthKey}
        currentBudgetAmount={currentBudget?.amount || 0}
        onSaveBudget={handleSaveBudget}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
