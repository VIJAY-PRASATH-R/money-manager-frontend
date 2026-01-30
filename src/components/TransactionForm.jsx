import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, Tag, CreditCard } from 'lucide-react';
import api from '../api/axios';

const CATEGORIES = {
    income: ['Salary', 'Business', 'Freelance', 'Investment', 'Other'],
    expense: ['Fuel', 'Food', 'Groceries', 'Medical', 'Loan', 'Rent', 'Shopping', 'Transfer', 'Other'],
    transfer: ['Same Bank', 'Other Bank', 'Cash Withdrawal', 'Deposit', 'Other']
};

const ACCOUNTS = ['Cash', 'Bank Account', 'Credit Card', 'Savings', 'Wallet'];

const TransactionForm = ({ isOpen, onClose, onSuccess, editData }) => {
    const [activeTab, setActiveTab] = useState('expense');
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        division: 'Personal',
        description: '',
        date: new Date().toISOString().slice(0, 16),
        account: 'Cash',
        toAccount: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editData) {
            setActiveTab(editData.type);
            setFormData({
                amount: editData.amount,
                category: editData.category,
                division: editData.division,
                description: editData.description,
                date: new Date(editData.date).toISOString().slice(0, 16),
                account: editData.account,
                toAccount: editData.toAccount || ''
            });
        } else {
            // Reset form
            setFormData(prev => ({
                ...prev,
                amount: '',
                description: '',
                category: ''
            }));
        }
    }, [editData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { ...formData, type: activeTab, amount: Number(formData.amount) };
            if (editData) await api.put(`/transactions/${editData._id}`, payload);
            else await api.post('/transactions', payload);
            onSuccess();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-8 animate-in slide-in-from-bottom-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-zinc-900">
                        {editData ? 'Edit Transaction' : 'New Transaction'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                        <X size={24} className="text-zinc-400 hover:text-zinc-900" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-zinc-50 p-1 rounded-2xl mb-8">
                    <button
                        onClick={() => setActiveTab('expense')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'expense' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        Expense
                    </button>
                    <button
                        onClick={() => setActiveTab('income')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        Income
                    </button>
                    <button
                        onClick={() => setActiveTab('transfer')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${activeTab === 'transfer' ? 'bg-blue-500 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                    >
                        Transfer
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Amount Input (Large) */}
                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Amount</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-400">₹</span>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-6 py-2 text-4xl font-bold text-zinc-900 bg-transparent border-b-2 border-zinc-100 focus:border-zinc-900 outline-none placeholder:text-zinc-200 transition-colors"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {/* Division & Category Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Division */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Division</label>
                            <div className="flex bg-zinc-50 p-1 rounded-xl">
                                {['Personal', 'Office'].map(div => (
                                    <button
                                        key={div}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, division: div })}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.division === div ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400'
                                            }`}
                                    >
                                        {div}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3 text-zinc-400" size={16} />
                                <select
                                    required
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 appearance-none"
                                >
                                    <option value="">Select</option>
                                    {CATEGORIES[activeTab].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Account & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">From</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-9 text-zinc-400" size={16} />
                                <select
                                    required
                                    value={formData.account}
                                    onChange={e => setFormData({ ...formData, account: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 appearance-none"
                                >
                                    {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                                </select>
                            </div>
                        </div>
                        {activeTab === 'transfer' ? (
                            <div className="relative">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">To</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-9 text-zinc-400" size={16} />
                                    <select
                                        required
                                        value={formData.toAccount}
                                        onChange={e => setFormData({ ...formData, toAccount: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 appearance-none"
                                    >
                                        <option value="">Select Account</option>
                                        {ACCOUNTS.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                                    </select>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Date</label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                                />
                            </div>
                        )}
                    </div>
                    {/* Date Field for Transfer (Full Width) */}
                    {activeTab === 'transfer' && (
                        <div className="relative">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Date</label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10"
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Description</label>
                        <input
                            type="text"
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-50 rounded-xl text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 placeholder:text-zinc-400"
                            placeholder="What was this for?"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-zinc-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all ${activeTab === 'expense' ? 'bg-zinc-900' : activeTab === 'income' ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                    >
                        {submitting ? 'Saving...' : 'Save Transaction'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
