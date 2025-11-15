import React, { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api';
import { useTransactions, useCreateTransaction } from '../hooks/useTransactions';
import TransactionsList from './TransactionsList';

// Category icons mapping
const categoryIcons = {
    'Food': '🍔',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills': '💡',
    'Healthcare': '🏥',
    'Education': '📚',
    'Salary': '💰',
    'Investment': '📈',
    'Other': '📦'
};

const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || categoryIcons['Other'];
};

const Transactions = () => {
    const { data: transactions = [], isLoading: isTransactionsLoading, error: transactionsError } = useTransactions();
    const { mutateAsync: createTransaction, isPending: isCreating } = useCreateTransaction();
    const [categories, setCategories] = useState([]);
    const [tags] = useState(['#groceries', '#transport', '#bills']);
    const [selectedTags, setSelectedTags] = useState([]);
    const [voiceModalOpen, setVoiceModalOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [form, setForm] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category_id: '',
        tags: ''
    });
    const filteredTransactions = useMemo(() => {
        if (!transactions?.length) {
            return [];
        }

        if (!selectedTags.length) {
            return transactions;
        }

        return transactions.filter(transaction => {
            if (!transaction.tags) return false;
            const transactionTags = transaction.tags.split(' ').filter(Boolean);
            return selectedTags.some(tag => transactionTags.includes(tag));
        });
    }, [transactions, selectedTags]);

    const totalTransactions = filteredTransactions.length;
    const summaryEmptyState = (
        <div className="text-center py-12 text-text-muted">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started</p>
        </div>
    );

    const mainEmptyState = (
        <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-text-muted">No transactions yet. Add your first one!</p>
        </div>
    );

    const renderSummaryTransaction = useCallback((transaction) => (
        <div className="transaction-item h-full">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        transaction.type === 'income' ? 'bg-success/20' : 'bg-danger/20'
                    }`}>
                        {getCategoryIcon(transaction.category?.name || 'Other')}
                    </div>
                    <div>
                        <h4 className="font-medium text-text-primary">{transaction.description}</h4>
                        <p className="text-sm text-text-secondary">
                            {transaction.category?.name || 'Uncategorized'} •
                            {new Date(transaction.date).toLocaleDateString()}
                        </p>
                        {transaction.tags && (
                            <div className="flex gap-1 mt-1">
                                {transaction.tags.split(' ').filter(tag => tag).map((tag, i) => (
                                    <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className={`text-right ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    <p className="font-semibold tabular-nums">
                        {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(Number(transaction.amount || 0)).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    ), []);

    const renderDetailedTransaction = useCallback((transaction) => (
        <div className="transaction-item h-full">
            <div className="flex items-center gap-4 flex-1">
                <div className={`transaction-icon ${
                    transaction.type === 'income' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-danger/20 text-danger'
                }`}>
                    {getCategoryIcon(transaction.category?.name || 'Other')}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                        {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="badge badge-primary text-xs">
                            {transaction.category?.name || 'Uncategorized'}
                        </span>
                        <span className="text-xs text-text-muted">
                            {new Date(transaction.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className={transaction.type === 'income' ? 'transaction-amount-positive' : 'transaction-amount-negative'}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount || 0).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    ), []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesRes = await api.get('/categories');
                setCategories(categoriesRes.data);
                if (categoriesRes.data.length > 0) {
                    setForm(prevForm => ({ ...prevForm, category_id: categoriesRes.data[0].id }));
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Removed interaction store usage

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // COMPREHENSIVE VALIDATION
        if (!form.description.trim()) {
            alert('Description is required');
            return;
        }
        
        if (!form.amount || parseFloat(form.amount) <= 0) {
            alert('Amount must be a positive number');
            return;
        }
        
        if (!form.category_id) {
            alert('Please select a category');
            return;
        }
        
        if (!['income', 'expense'].includes(form.type)) {
            alert('Invalid transaction type');
            return;
        }

        console.log('[VALIDATION] All checks passed for transaction:', form);
        
        try {
            const transactionData = {
                description: form.description.trim(),
                amount: parseFloat(form.amount),
                type: form.type,
                category_id: parseInt(form.category_id),
                tags: form.tags.trim()
            };

            console.log('[REQUEST] Sending transaction data:', transactionData);
            await createTransaction(transactionData);

            setForm({ 
                description: '', 
                amount: '', 
                type: 'expense', 
                category_id: categories.length > 0 ? categories[0].id : '', 
                tags: '' 
            });
            
            // Haptic feedback (if supported)
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }

            alert('Transaction added successfully!');
        } catch (error) {
            console.error("Error adding transaction:", error);
            console.error("Error response:", error.response?.data);
            
            let errorMessage = 'Failed to add transaction. Please try again.';
            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Please log in to add transactions';
                } else if (error.response.data?.detail) {
                    const detail = error.response.data.detail;
                    if (typeof detail === 'string') {
                        errorMessage = detail;
                    } else if (Array.isArray(detail) && detail[0]?.msg) {
                        errorMessage = detail.map(d => d.msg).join('\n');
                    }
                    else {
                        errorMessage = JSON.stringify(detail);
                    }
                }
            }
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleVoiceInput = () => {
        setVoiceModalOpen(true);
        setIsRecording(true);
        
        // Haptic feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }

        // Simulate voice recording (in production, integrate with backend voice-to-text API)
        setTimeout(() => {
            setIsRecording(false);
            setForm(prev => ({ ...prev, description: 'Coffee at Starbucks', amount: '5.50' }));
            setVoiceModalOpen(false);
        }, 3000);
    };

    const addTag = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const removeTag = (tag) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-gradient-primary mb-4">Transactions</h1>
                
                <div className="flex flex-wrap gap-2 mb-6">
                    <span className="text-text-muted text-sm self-center mr-2">Filter by tags:</span>
                    {tags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                            className={`tag-chip ${selectedTags.includes(tag) ? 'ring-2 ring-primary' : ''}`}
                        >
                            {tag}
                            {selectedTags.includes(tag) && (
                                <svg className="w-4 h-4 tag-chip-remove" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    ))}
                    <button className="px-3 py-1.5 rounded-full border-2 border-dashed border-primary/30 text-primary text-sm hover:border-primary transition-colors">
                        + Add Tag
                    </button>
                </div>
            </div>

            {transactionsError && (
                <div className="glass-card border border-danger/40 bg-danger/5 text-danger px-4 py-3">
                    <p className="font-semibold">Failed to load transactions.</p>
                    <p className="text-sm">
                        {transactionsError.response?.data?.detail || transactionsError.message}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass-card p-6 sticky top-20">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-text-primary">Add Transaction</h2>
                            <button 
                                onClick={handleVoiceInput}
                                className="p-3 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                                title="Voice Input"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                                <input 
                                    type="text" 
                                    name="description" 
                                    value={form.description} 
                                    onChange={handleInputChange}
                                    className="input"
                                    placeholder="e.g., Coffee at Starbucks"
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">₹</span>
                                    <input 
                                        type="number" 
                                        name="amount" 
                                        value={form.amount} 
                                        onChange={handleInputChange}
                                        className="input-financial pl-8"
                                        placeholder="0.00"
                                        step="0.01"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setForm({...form, type: 'expense'})}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        form.type === 'expense'
                                            ? 'border-danger bg-danger/10 text-danger'
                                            : 'border-glass-light glass-bg text-text-muted hover:border-danger/50'
                                    }`}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                    </svg>
                                    <span className="text-sm font-medium">Expense</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setForm({...form, type: 'income'})}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        form.type === 'income'
                                            ? 'border-success bg-success/10 text-success'
                                            : 'border-glass-light glass-bg text-text-muted hover:border-success/50'
                                    }`}
                                >
                                    <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                    <span className="text-sm font-medium">Income</span>
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
                                <select 
                                    name="category_id" 
                                    value={form.category_id} 
                                    onChange={handleInputChange}
                                    className="input"
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {getCategoryIcon(cat.name)} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Tags (optional)</label>
                                <input 
                                    type="text" 
                                    name="tags" 
                                    value={form.tags} 
                                    onChange={handleInputChange}
                                    className="input"
                                    placeholder="#vacation #groceries"
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isCreating}
                                className={`${form.type === 'expense' ? 'btn-danger w-full' : 'btn-success w-full'} ${isCreating ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>{isCreating ? 'Saving...' : 'Add Transaction'}</span>
                                </div>
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">Recent Transactions</h3>
                        <div className="space-y-2">
                            {isTransactionsLoading ? (
                                <div className="text-center py-12 text-text-muted">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p>Loading transactions...</p>
                                </div>
                            ) : (
                                <TransactionsList
                                    transactions={filteredTransactions}
                                    renderItem={renderSummaryTransaction}
                                    emptyState={summaryEmptyState}
                                    itemSize={124}
                                    height={396}
                                />
                            )}
                        </div>
                    </div>



                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-text-primary">Recent Transactions</h2>
                                <p className="text-sm text-text-muted">{totalTransactions} total transactions</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                                    All
                                </button>
                                <button className="px-4 py-2 rounded-lg glass-bg text-text-muted text-sm hover:bg-glass-light transition-colors">
                                    This Month
                                </button>
                            </div>
                        </div>

                        {isTransactionsLoading ? (
                            <div className="text-center py-12 text-text-muted">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p>Loading transactions...</p>
                            </div>
                        ) : (
                            <TransactionsList
                                transactions={filteredTransactions}
                                renderItem={renderDetailedTransaction}
                                emptyState={mainEmptyState}
                                itemSize={118}
                                height={520}
                            />
                        )}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleVoiceInput}
                className="fab"
                title="Voice Input - Say your transaction"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>

            {voiceModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
                        <h3 className="text-2xl font-bold text-gradient-primary">Voice Input</h3>
                        
                        <div className="relative h-32 flex items-center justify-center">
                            {isRecording ? (
                                <div className="flex items-end justify-center gap-1">
                                    {[...Array(20)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-primary rounded-full animate-pulse"
                                            style={{
                                                height: `${Math.random() * 80 + 20}px`,
                                                animationDelay: `${i * 0.05}s`,
                                                animationDuration: '0.6s'
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-success">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="mt-2 text-sm">Recording complete!</p>
                                </div>
                            )}
                        </div>

                        <p className="text-text-secondary">
                            {isRecording ? 'Listening... Speak now!' : 'Processing your voice input...'}
                        </p>

                        {!isRecording && (
                            <button 
                                onClick={() => setVoiceModalOpen(false)}
                                className="btn-primary"
                            >
                                Done
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transactions;
