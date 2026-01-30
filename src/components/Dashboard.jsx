import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutGrid, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight,
    Search, Bell, User, Plus, CreditCard, Wallet, FileText, Download,
    Trash2, Edit2, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, startOfWeek, endOfWeek, startOfYear, endOfYear, differenceInHours } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useToast } from '../context/ToastContext';
import TransactionForm from './TransactionForm';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const COLORS = ['#18181B', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard = () => { // Consider renaming to MainLayout if expanding
    // State
    const [view, setView] = useState('Overview'); // 'Overview', 'Analytics', 'Transactions'
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Filters
    const [period, setPeriod] = useState('monthly');
    const [division, setDivision] = useState('all');

    const toast = useToast();

    // Fetch Data
    const fetchTransactions = async () => {
        try {
            const params = { period };
            if (division !== 'all') params.division = division;

            // Date Filters
            const now = new Date();
            if (period === 'weekly') {
                params.startDate = startOfWeek(now, { weekStartsOn: 1 });
                params.endDate = endOfWeek(now, { weekStartsOn: 1 });
            } else if (period === 'monthly') {
                params.startDate = startOfMonth(now);
                params.endDate = endOfMonth(now);
            } else if (period === 'yearly') {
                params.startDate = startOfYear(now);
                params.endDate = endOfYear(now);
            }

            const res = await axios.get(`${API_URL}/transactions`, { params });
            const data = res.data;

            setTransactions(data);
            calculateSummary(data);
            prepareChartData(data);
            preparePieData(data);
        } catch (error) {
            console.error("Error fetching transactions", error);
            // toast.error("Failed to load data"); // Silent fail to avoid spam
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [period, division]);

    // Helpers
    const calculateSummary = (data) => {
        const income = data.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = data.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        setSummary({ income, expense, balance: income - expense });
    };

    const prepareChartData = (data) => {
        if (!data || data.length === 0) {
            setChartData([]);
            return;
        }
        // Group by Date
        const grouped = data.reduce((acc, t) => {
            const dateStr = format(parseISO(t.date), 'MMM dd');
            if (!acc[dateStr]) acc[dateStr] = { date: dateStr, income: 0, expense: 0, rawDate: new Date(t.date) };
            if (t.type === 'income') acc[dateStr].income += t.amount;
            else acc[dateStr].expense += t.amount;
            return acc;
        }, {});

        // Sort by date
        const sorted = Object.values(grouped).sort((a, b) => a.rawDate - b.rawDate);
        setChartData(sorted);
    };

    const preparePieData = (data) => {
        const expenseData = data.filter(t => t.type === 'expense');
        const grouped = expenseData.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

        const result = Object.keys(grouped).map(key => ({
            name: key,
            value: grouped[key]
        })).sort((a, b) => b.value - a.value);

        setPieData(result);
    };

    // Handlers
    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditItem(null);
        fetchTransactions();
        toast.success(editItem ? "Transaction updated" : "Transaction added");
    };

    const handleEdit = (item) => {
        const diff = differenceInHours(new Date(), new Date(item.date)); // Use user-set date or item.createdAt if available
        // Note: Backend checks createdAt, but for UX we check item.date here for simplicity or createdAt if available.
        // Let's assume strict 12h from creation. If createdAt is not available, allow or use date.
        // To be safe and strict as per requirement:
        if (item.createdAt && differenceInHours(new Date(), new Date(item.createdAt)) > 12) {
            alert("Editing is restricted after 12 hours."); // Simple alert or toast
            return;
        }
        setEditItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (window.confirm('Delete this transaction?')) {
            try {
                await axios.delete(`${API_URL}/transactions/${id}`);
                fetchTransactions();
                toast.success('Deleted');
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount", "Division"];
        const rows = transactions.map(t => [
            format(parseISO(t.date), 'yyyy-MM-dd'),
            `"${t.description}"`,
            t.category,
            t.type,
            t.amount,
            t.division
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "transactions.csv";
        link.click();
    };

    /* ================= Views ================= */

    // 1. Overview View (Dashboard)
    const renderOverview = () => (
        <>
            {/* Portfolio Cards */}
            <section className="mb-8">
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 snap-x hide-scroll">
                    {/* Total Balance */}
                    <div className="min-w-[280px] h-[160px] bg-zinc-900 rounded-[24px] p-6 text-white shadow-xl shadow-zinc-200 flex flex-col justify-between shrink-0 snap-center">
                        <div className="flex justify-between items-start">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center"><Wallet size={20} className="text-white" /></div>
                            <span className="bg-zinc-800 text-xs font-bold px-2 py-1 rounded-full">Wallet</span>
                        </div>
                        <div>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
                            <h3 className="text-3xl font-bold tracking-tight">₹{summary.balance.toLocaleString()}</h3>
                        </div>
                    </div>
                    {/* Income */}
                    <div className="min-w-[240px] h-[160px] bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between shrink-0 snap-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><ArrowDownRight size={20} className="text-emerald-500" /></div>
                        <div>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Total Income</p>
                            <h3 className="text-2xl font-bold text-zinc-900">₹{summary.income.toLocaleString()}</h3>
                        </div>
                    </div>
                    {/* Expense */}
                    <div className="min-w-[240px] h-[160px] bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between shrink-0 snap-center">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center"><ArrowUpRight size={20} className="text-rose-500" /></div>
                        <div>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">Total Expense</p>
                            <h3 className="text-2xl font-bold text-zinc-900">₹{summary.expense.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Chart */}
            <section className="bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm mb-8 h-[360px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-zinc-900">Cash Flow</h3>
                    <div className="flex gap-2">
                        {['weekly', 'monthly', 'yearly'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg capitalize ${period === p ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-500'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                            <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={0} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </>
    );

    // 2. Analytics View
    const renderAnalytics = () => (
        <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-bold mb-6">Spending Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart Large */}
                <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm h-[400px] flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 self-start">Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Categories List */}
                <div className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm h-[400px] overflow-y-auto">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Top Categories</h3>
                    <div className="space-y-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index % COLORS.length] }}></div>
                                    <span className="font-bold text-sm text-zinc-900">{entry.name}</span>
                                </div>
                                <span className="font-bold text-sm text-zinc-900">₹{entry.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // 3. Transactions View
    const renderTransactions = () => (
        <div className="animate-in fade-in duration-300 bg-white rounded-[24px] shadow-sm border border-zinc-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">All Transactions</h2>
                <button onClick={exportToCSV} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900">
                    <Download size={16} /> Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-zinc-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-zinc-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {transactions.map((t) => (
                            <tr key={t._id} className="hover:bg-zinc-50 transition-colors group">
                                <td className="px-6 py-4 text-sm font-medium text-zinc-500">{format(parseISO(t.date), 'MMM dd, yyyy')}</td>
                                <td className="px-6 py-4 text-sm font-bold text-zinc-900">{t.description}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">{t.category}</span></td>
                                <td className={`px-6 py-4 text-sm font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-zinc-900'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(t)} className="p-2 text-zinc-400 hover:text-indigo-500"><Edit2 size={16} /></button>
                                        <button onClick={(e) => handleDelete(t._id, e)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-[#FAFAFA] text-zinc-900 font-[Inter] overflow-hidden">

            {/* Sidebar */}
            <aside className="w-[240px] h-full flex flex-col pt-8 pb-6 px-6 border-r border-zinc-100 bg-white hidden lg:flex">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-lg">M</div>
                    <span className="text-xl font-bold tracking-tight">Money Manager.</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { name: 'Overview', icon: LayoutGrid },
                        { name: 'Analytics', icon: PieChartIcon },
                        { name: 'Transactions', icon: FileText },
                    ].map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setView(item.name)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200
                                ${view === item.name
                                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}
                        >
                            <item.icon size={20} className={view === item.name ? "text-emerald-400" : "text-zinc-400"} />
                            {item.name}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-6 lg:p-10 relative scroll-smooth">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{view}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Division Toggle */}
                        <div className="flex bg-white border border-zinc-200 rounded-lg p-1 shadow-sm">
                            {['all', 'Personal', 'Office'].map(div => (
                                <button
                                    key={div}
                                    onClick={() => setDivision(div)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${division === div ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                                        }`}
                                >
                                    {div === 'all' ? 'All' : div}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-zinc-300 transition-transform active:scale-95">
                            <Plus size={18} /> New
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                {view === 'Overview' && renderOverview()}
                {view === 'Analytics' && renderAnalytics()}
                {view === 'Transactions' && renderTransactions()}

            </main>

            {/* Right Panel (Only on Overview) */}
            {view === 'Overview' && (
                <aside className="w-[340px] h-full bg-white border-l border-zinc-100 p-8 hidden xl:flex flex-col overflow-y-auto">
                    {/* Credit Card */}
                    <div className="w-full h-[200px] bg-zinc-900 rounded-[28px] p-6 relative overflow-hidden text-white shadow-2xl shadow-zinc-200 mb-10 group cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-20"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Universal</span>
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xl font-mono tracking-widest mb-2">**** 4589</p>
                                <p className="text-sm font-bold">Vijay P</p>
                            </div>
                        </div>
                    </div>

                    {/* Mini Pie Chart (Summary) */}
                    <div className="mb-10">
                        <h3 className="font-bold text-sm text-zinc-900 mb-4">Expenses</h3>
                        <div className="h-[200px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-xs text-zinc-400 font-bold block">Total</span>
                                <span className="text-sm font-bold text-zinc-900">₹{summary.expense}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent List */}
                    <div className="flex-1">
                        <h3 className="font-bold text-sm text-zinc-900 mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {transactions.slice(0, 5).map(t => (
                                <div key={t._id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-zinc-50 text-zinc-500'}`}>
                                            {t.type === 'income' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900">{t.description}</p>
                                            <p className="text-[10px] text-zinc-400">{format(parseISO(t.date), 'MMM dd')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-zinc-900">
                                            {t.type === 'income' ? '+' : '-'}₹{t.amount}
                                        </span>
                                        <button onClick={(e) => handleDelete(t._id, e)} className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            )}

            {/* Modal */}
            <TransactionForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                editData={editItem}
            />
        </div>
    );
};

export default Dashboard;
