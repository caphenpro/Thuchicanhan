import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, Category, MonthBudget } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  formatCurrency,
  formatCompactNumber,
  formatDateVietnamese,
  formatMonthLabel,
  shiftMonthKey,
} from '../utils/formatters';

interface VisualChartsProps {
  currentMonthKey: string;
  transactions: Transaction[];
  allTransactions: Transaction[];
  categories: Category[];
  budget?: MonthBudget;
}

export const VisualCharts: React.FC<VisualChartsProps> = ({
  currentMonthKey,
  transactions,
  allTransactions,
  categories,
  budget,
}) => {
  // Active chart view tab: 'category' (Cơ cấu danh mục) | 'daily' (Thu-Chi theo ngày) | 'cumulative' (Chi tiêu tích lũy) | 'multimonth' (Xu hướng 6 tháng)
  const [activeTab, setActiveTab] = useState<'category' | 'daily' | 'cumulative' | 'multimonth'>('category');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');

  // Map category lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // 1. Data for Category Pie/Donut Chart
  const categoryChartData = useMemo(() => {
    const targetTxs = transactions.filter((t) => t.type === categoryType);
    const total = targetTxs.reduce((sum, t) => sum + t.amount, 0);

    const amountByCat: { [catId: string]: number } = {};
    targetTxs.forEach((t) => {
      amountByCat[t.categoryId] = (amountByCat[t.categoryId] || 0) + t.amount;
    });

    const result = Object.entries(amountByCat)
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        const percent = total > 0 ? (amount / total) * 100 : 0;
        return {
          id: catId,
          name: cat ? cat.name : 'Khác',
          color: cat ? cat.color : '#64748b',
          icon: cat ? cat.icon : 'Tag',
          amount,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { items: result, total };
  }, [transactions, categoryType, categoryMap]);

  // 2. Data for Daily Bar Chart (All days of the selected month)
  const dailyChartData = useMemo(() => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayMap: { [day: number]: { income: number; expense: number } } = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dayMap[i] = { income: 0, expense: 0 };
    }

    transactions.forEach((t) => {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        const day = parseInt(parts[2], 10);
        if (dayMap[day]) {
          if (t.type === 'income') dayMap[day].income += t.amount;
          if (t.type === 'expense') dayMap[day].expense += t.amount;
        }
      }
    });

    return Array.from({ length: daysInMonth }, (_, idx) => {
      const day = idx + 1;
      return {
        day: `${day < 10 ? '0' : ''}${day}`,
        fullDate: `${currentMonthKey}-${day < 10 ? '0' : ''}${day}`,
        income: dayMap[day].income,
        expense: dayMap[day].expense,
        net: dayMap[day].income - dayMap[day].expense,
      };
    });
  }, [currentMonthKey, transactions]);

  // 3. Data for Cumulative Spending vs Budget Area Chart
  const cumulativeChartData = useMemo(() => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    let runningExpense = 0;
    let runningIncome = 0;

    return Array.from({ length: daysInMonth }, (_, idx) => {
      const day = idx + 1;
      const dayStr = `${currentMonthKey}-${day < 10 ? '0' : ''}${day}`;
      const dayTxs = transactions.filter((t) => t.date === dayStr);

      const dayExpense = dayTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const dayIncome = dayTxs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

      runningExpense += dayExpense;
      runningIncome += dayIncome;

      return {
        day: `${day < 10 ? '0' : ''}${day}`,
        fullDate: dayStr,
        cumulativeExpense: runningExpense,
        cumulativeIncome: runningIncome,
        budget: budget ? budget.amount : null,
      };
    });
  }, [currentMonthKey, transactions, budget]);

  // 4. Data for 6-Month Trend Chart
  const multiMonthData = useMemo(() => {
    const months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      months.push(shiftMonthKey(currentMonthKey, -i));
    }

    return months.map((mKey) => {
      const mTransactions = allTransactions.filter((t) => t.date.startsWith(mKey));
      const income = mTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = mTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const [y, m] = mKey.split('-');
      return {
        monthKey: mKey,
        monthLabel: `T${parseInt(m, 10)}/${y.slice(2)}`,
        income,
        expense,
        balance: income - expense,
      };
    });
  }, [currentMonthKey, allTransactions]);

  interface InsightData {
    dailyAvg: number;
    highestDay: { day: string; amount: number; fullDate: string } | null;
    topCat: { id: string; name: string; color: string; icon: string; amount: number; percent: number } | null;
    savingsRate: number;
  }

  // Smart Insights computation
  const insights = useMemo<InsightData>(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTxs.reduce((s, t) => s + t.amount, 0);
    const totalInc = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const [year, month] = currentMonthKey.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyAvg = totalExp > 0 ? totalExp / daysInMonth : 0;

    // Highest spending day
    let highestDay: { day: string; amount: number; fullDate: string } | null = null;
    dailyChartData.forEach((d) => {
      if (d.expense > 0 && (!highestDay || d.expense > (highestDay as { amount: number }).amount)) {
        highestDay = { day: d.day, amount: d.expense, fullDate: d.fullDate };
      }
    });

    // Top category
    const topCat = categoryChartData.items.length > 0 ? categoryChartData.items[0] : null;

    return {
      dailyAvg,
      highestDay,
      topCat,
      savingsRate: totalInc > 0 ? Math.round(((totalInc - totalExp) / totalInc) * 100) : 0,
    };
  }, [transactions, currentMonthKey, dailyChartData, categoryChartData]);

  // Custom tooltips
  const CustomCategoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700/50 backdrop-blur-xs">
          <div className="flex items-center gap-2 font-semibold mb-1 text-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name}
          </div>
          <div className="text-slate-300">
            Số tiền: <span className="font-bold text-white">{formatCurrency(data.amount)}</span>
          </div>
          <div className="text-slate-300">
            Tỷ trọng: <span className="font-bold text-emerald-400">{data.percent.toFixed(1)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDailyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700/50 backdrop-blur-xs min-w-[180px]">
          <div className="font-semibold mb-2 text-slate-200 border-b border-slate-700 pb-1">
            {formatDateVietnamese(data.fullDate)}
          </div>
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span>Thu nhập:</span>
            <span className="font-bold">{formatCurrency(data.income)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span>Chi tiêu:</span>
            <span className="font-bold">{formatCurrency(data.expense)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
            <span>Chênh lệch:</span>
            <span className={`font-bold ${data.net >= 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
              {formatCurrency(data.net)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Chart Navigation Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Thống Kê Biểu Đồ Trực Quan</span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-1">
              {formatMonthLabel(currentMonthKey)}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích chuyên sâu cơ cấu tài chính, dòng tiền và xu hướng thu chi
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto text-xs font-semibold">
          <button
            id="tab-chart-category"
            onClick={() => setActiveTab('category')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cơ cấu danh mục</span>
          </button>

          <button
            id="tab-chart-daily"
            onClick={() => setActiveTab('daily')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>Thu - Chi theo ngày</span>
          </button>

          <button
            id="tab-chart-cumulative"
            onClick={() => setActiveTab('cumulative')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'cumulative'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>Chi tiêu tích lũy</span>
          </button>

          <button
            id="tab-chart-multimonth"
            onClick={() => setActiveTab('multimonth')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'multimonth'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Xu hướng 6 tháng</span>
          </button>
        </div>
      </div>

      {/* Main Chart Content Area */}
      <div className="p-4 sm:p-6">
        {/* TAB 1: Cơ Cấu Danh Mục (Donut Chart + List) */}
        {activeTab === 'category' && (
          <div>
            {/* Expense vs Income toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs font-medium">
                <button
                  id="btn-cat-expense"
                  onClick={() => setCategoryType('expense')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    categoryType === 'expense'
                      ? 'bg-rose-500 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cơ cấu Chi Tiêu
                </button>
                <button
                  id="btn-cat-income"
                  onClick={() => setCategoryType('income')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    categoryType === 'income'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cơ cấu Thu Nhập
                </button>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Tổng cộng: <strong className="text-slate-800">{formatCurrency(categoryChartData.total)}</strong>
              </span>
            </div>

            {categoryChartData.items.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <PieIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Chưa có dữ liệu {categoryType === 'expense' ? 'chi tiêu' : 'thu nhập'} trong tháng này.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hãy thêm giao dịch để xem biểu đồ phân bổ trực quan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Donut Chart */}
                <div className="lg:col-span-5 h-[280px] sm:h-[320px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData.items}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={3}
                        dataKey="amount"
                      >
                        {categoryChartData.items.map((entry) => (
                          <Cell key={`cell-${entry.id}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomCategoryTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Center Label */}
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {categoryType === 'expense' ? 'Tổng Chi' : 'Tổng Thu'}
                    </span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                      {formatCompactNumber(categoryChartData.total)}
                    </span>
                  </div>
                </div>

                {/* Categories Breakdown List */}
                <div className="lg:col-span-7 space-y-2.5 max-h-[330px] overflow-y-auto pr-1">
                  {categoryChartData.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: item.color }}
                          >
                            <CategoryIcon name={item.icon} size={15} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800">{item.name}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 mr-2">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {item.percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Thu - Chi Theo Từng Ngày (Daily Bar Chart) */}
        {activeTab === 'daily' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-500">
                Biểu đồ cột so sánh Thu (Xanh lá) và Chi (Đỏ) theo từng ngày trong tháng:
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Thu nhập
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Chi tiêu
                </span>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip content={<CustomDailyTooltip />} />
                  <Bar dataKey="income" name="Thu nhập" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                  <Bar dataKey="expense" name="Chi tiêu" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Di chuột hoặc chạm vào cột của từng ngày để xem chi tiết khoản thu, chi và số chênh lệch.
            </p>
          </div>
        )}

        {/* TAB 3: Chi Tiêu Tích Lũy & Hạn Mức (Cumulative Area Chart) */}
        {activeTab === 'cumulative' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <span className="text-xs font-medium text-slate-500">
                Theo dõi tốc độ chi tiêu dồn tích theo từng ngày so với tổng thu nhập và hạn mức ngân sách:
              </span>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-3 h-2 rounded-xs bg-rose-400 inline-block" /> Chi tiêu lũy kế
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-2 rounded-xs bg-emerald-400 inline-block" /> Thu nhập lũy kế
                </span>
                {budget && (
                  <span className="flex items-center gap-1.5 text-amber-600">
                    <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed" /> Hạn mức ({formatCompactNumber(budget.amount)})
                  </span>
                )}
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatCurrency(Number(val)),
                      name === 'cumulativeExpense'
                        ? 'Chi tiêu lũy kế'
                        : name === 'cumulativeIncome'
                        ? 'Thu nhập lũy kế'
                        : 'Hạn mức',
                    ]}
                    labelFormatter={(label) => `Ngày ${label} trong tháng`}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeExpense"
                    name="cumulativeExpense"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeIncome"
                    name="cumulativeIncome"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 4: Xu Hướng 6 Tháng Gần Nhất (Multi-Month Bar Chart) */}
        {activeTab === 'multimonth' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-slate-500">
                Xu hướng biến động Thu nhập, Chi tiêu và Thặng dư qua 6 tháng liên tiếp:
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Thu nhập
                </span>
                <span className="flex items-center gap-1.5 text-rose-500">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" /> Chi tiêu
                </span>
              </div>
            </div>

            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={multiMonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="monthLabel"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatCurrency(Number(val)),
                      name === 'income' ? 'Thu nhập' : 'Chi tiêu',
                    ]}
                  />
                  <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Smart Insights Footer Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Insight 1: Top Category */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Chi nhiều nhất
            </span>
            <span className="text-sm font-bold text-slate-900">
              {insights.topCat ? insights.topCat.name : 'Chưa có'}
            </span>
            <span className="text-xs text-slate-500 block">
              {insights.topCat ? `${formatCurrency(insights.topCat.amount)} (${insights.topCat.percent.toFixed(1)}%)` : '0 ₫'}
            </span>
          </div>
        </div>

        {/* Insight 2: Daily Average */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Trung bình mỗi ngày
            </span>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(insights.dailyAvg)}
            </span>
            <span className="text-xs text-slate-500 block">
              ước tính theo cả tháng
            </span>
          </div>
        </div>

        {/* Insight 3: Peak Spending Day */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Ngày chi cao nhất
            </span>
            <span className="text-sm font-bold text-slate-900">
              {insights.highestDay ? `Ngày ${insights.highestDay.day}` : 'Chưa có'}
            </span>
            <span className="text-xs text-slate-500 block">
              {insights.highestDay ? formatCurrency(insights.highestDay.amount) : '0 ₫'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
