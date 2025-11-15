import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

// Category icons for budgets
const categoryIcons = {
    'Food': '🍔',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills': '💡',
    'Healthcare': '🏥',
    'Education': '📚',
    'Other': '📦'
};

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [form, setForm] = useState({ category_id: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            // Small delay to ensure auth cookie is set
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
                // Fetch categories
                const categoriesRes = await axios.get(`${API_URL}/categories`);
                console.log('Categories fetched:', categoriesRes.data);
                setCategories(categoriesRes.data);
                if (categoriesRes.data.length > 0) {
                    setForm(prevForm => ({ ...prevForm, category_id: categoriesRes.data[0].id }));
                }

                // Fetch budgets for current month
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();
                const budgetsRes = await axios.get(`${API_URL}/goals/budgets?month=${month}&year=${year}`);
                console.log('Budgets fetched:', budgetsRes.data);
                setBudgets(budgetsRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                console.error("Error details:", error.response);
                
                if (error.response?.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    window.location.href = '/login';
                } else {
                    const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
                    alert(`Error loading budgets: ${errorMsg}\n\nCheck console for details.`);
                }
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form
            if (!form.category_id || !form.amount) {
                alert('Please fill in all required fields');
                return;
            }

            const budgetData = {
                category_id: parseInt(form.category_id),
                amount: parseFloat(form.amount),
                month: parseInt(form.month),
                year: parseInt(form.year)
            };

            console.log('Submitting budget:', budgetData);
            const response = await axios.post(`${API_URL}/goals/budgets`, budgetData);
            console.log('Budget created:', response.data);
            
            setBudgets([response.data, ...budgets]);
            setForm({ category_id: categories[0]?.id || '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });

            // Haptic feedback
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            alert('Budget added successfully!');
        } catch (error) {
            console.error("Error adding budget:", error);
            console.error("Error response:", error.response?.data);
            
            let errorMessage = 'Failed to add budget. Please try again.';
            if (error.response?.data?.detail) {
                errorMessage = typeof error.response.data.detail === 'string'
                    ? error.response.data.detail
                    : JSON.stringify(error.response.data.detail);
            }
            alert(`Error: ${errorMessage}`);
        }
    };

    // Calculate pace indicator
    const calculatePaceIndicator = (budget) => {
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(budget.year, budget.month, 0).getDate();
        
        const idealSpending = (currentDay / daysInMonth) * budget.amount;
        const idealPercentage = (idealSpending / budget.amount) * 100;
        const actualPercentage = (budget.current_spending / budget.amount) * 100;
        
        const isOnPace = budget.current_spending <= idealSpending;
        const daysRemaining = daysInMonth - currentDay;
        
        return {
            idealPercentage,
            actualPercentage,
            isOnPace,
            idealSpending,
            daysRemaining,
            dailyAverage: budget.current_spending / currentDay,
            projectedTotal: (budget.current_spending / currentDay) * daysInMonth
        };
    };

    const getCategoryIcon = (categoryName) => {
        return categoryIcons[categoryName] || categoryIcons['Other'];
    };

    const getBudgetStatus = (budget) => {
        const pace = calculatePaceIndicator(budget);
        if (pace.actualPercentage >= 100) return 'exceeded';
        if (pace.actualPercentage >= 90) return 'warning';
        if (pace.isOnPace) return 'healthy';
        return 'good';
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-gradient-primary mb-2">Budget Management</h1>
                <p className="text-text-muted">Track spending with AI-powered pace indicators</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-muted">Total Budget</span>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold text-text-primary tabular-nums">
                        ₹{budgets.reduce((sum, b) => sum + b.amount, 0).toLocaleString('en-IN')}
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-muted">Total Spent</span>
                        <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold text-danger tabular-nums">
                        ₹{budgets.reduce((sum, b) => sum + b.current_spending, 0).toLocaleString('en-IN')}
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-muted">Remaining</span>
                        <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold text-success tabular-nums">
                        ₹{budgets.reduce((sum, b) => sum + (b.amount - b.current_spending), 0).toLocaleString('en-IN')}
                    </p>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-muted">On Pace</span>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold text-text-primary tabular-nums">
                        {budgets.filter(b => calculatePaceIndicator(b).isOnPace).length}/{budgets.length}
                    </p>
                </div>
            </div>

            <div className="glass-card p-6 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-primary/20 text-primary">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">Set Budget</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <label className="block text-sm font-medium text-text-secondary mb-2">Budget Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">₹</span>
                            <input 
                                type="number" 
                                name="amount" 
                                value={form.amount} 
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="input-financial pl-8"
                                step="0.01"
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Month</label>
                        <select 
                            name="month" 
                            value={form.month} 
                            onChange={handleInputChange}
                            className="input"
                            required
                        >
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2025, i).toLocaleDateString('en-US', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button type="submit" className="btn-primary w-full">
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add Budget</span>
                            </div>
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {budgets.map(budget => {
                    const pace = calculatePaceIndicator(budget);
                    const status = getBudgetStatus(budget);
                    const statusColors = {
                        'exceeded': { bar: 'bg-danger', text: 'text-danger', bg: 'bg-danger/10', badge: 'badge-danger' },
                        'warning': { bar: 'bg-warning', text: 'text-warning', bg: 'bg-warning/10', badge: 'badge-warning' },
                        'healthy': { bar: 'bg-success', text: 'text-success', bg: 'bg-success/10', badge: 'badge-success' },
                        'good': { bar: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10', badge: 'badge-primary' }
                    };
                    const colors = statusColors[status];

                    return (
                        <div key={budget.id} className="glass-card-hover p-6 space-y-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-3xl">{getCategoryIcon(budget.category.name)}</span>
                                    <div>
                                        <h3 className="text-xl font-bold text-text-primary">{budget.category.name}</h3>
                                        <p className="text-sm text-text-muted">
                                            {new Date(budget.year, budget.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className={colors.badge}>
                                    {status === 'exceeded' && '⚠️ Over'}
                                    {status === 'warning' && '⚡ High'}
                                    {status === 'healthy' && '✓ Good'}
                                    {status === 'good' && '📊 Track'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Budget</p>
                                    <p className="text-lg font-bold text-text-primary tabular-nums">
                                        ₹{budget.amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-text-muted mb-1">Spent</p>
                                    <p className={`text-lg font-bold tabular-nums ${colors.text}`}>
                                        ₹{budget.current_spending.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-text-muted">
                                    <span>Progress</span>
                                    <span className="tabular-nums">{pace.actualPercentage.toFixed(1)}%</span>
                                </div>
                                
                                <div className="relative h-8 bg-glass-light rounded-lg overflow-hidden">
                                    <div 
                                        className={`absolute inset-y-0 left-0 ${colors.bar} transition-all duration-500 rounded-lg`}
                                        style={{ width: `${Math.min(pace.actualPercentage, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                    </div>

                                    <div 
                                        className="absolute inset-y-0 w-0.5 bg-primary z-10 transition-all duration-500"
                                        style={{ left: `${Math.min(pace.idealPercentage, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 w-1 -ml-px bg-primary shadow-glow-primary"></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full ring-2 ring-canvas shadow-lg"></div>
                                    </div>

                                    {pace.actualPercentage > 15 && (
                                        <div className="absolute inset-0 flex items-center px-3">
                                            <span className="text-xs font-bold text-white tabular-nums">
                                                {pace.actualPercentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 bg-primary rounded-sm ring-1 ring-primary/50"></div>
                                        <span className="text-text-muted">Ideal pace (Day {new Date().getDate()})</span>
                                    </div>
                                    <span className={`font-medium tabular-nums ${pace.isOnPace ? 'text-success' : 'text-danger'}`}>
                                        {pace.isOnPace ? '✓ On Pace' : '⚠ Over Pace'}
                                    </span>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg ${colors.bg} space-y-2`}>
                                <div className="flex items-start gap-2">
                                    {pace.isOnPace ? (
                                        <svg className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <svg className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                    <div className="flex-1">
                                        <p className={`text-xs font-medium ${colors.text}`}>
                                            {pace.isOnPace ? 'Spending On Track' : 'Spending Above Pace'}
                                        </p>
                                        <p className="text-xs text-text-muted mt-1">
                                            Daily average: ₹{pace.dailyAverage.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </p>
                                        <p className="text-xs text-text-muted">
                                            Projected total: ₹{pace.projectedTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            {pace.projectedTotal > budget.amount && (
                                                <span className="text-danger ml-1">
                                                    (+₹{(pace.projectedTotal - budget.amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} over)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-glass-light">
                                    <p className="text-xs text-text-muted">
                                        💡 <strong>{pace.daysRemaining} days remaining</strong> - 
                                        {pace.isOnPace 
                                            ? ` You can spend ₹${((budget.amount - budget.current_spending) / pace.daysRemaining).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/day`
                                            : ` Reduce to ₹${((budget.amount - budget.current_spending) / pace.daysRemaining).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/day to stay in budget`
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button className="btn-outline flex-1 text-sm py-2">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit
                                </button>
                                <button className="btn-glass text-sm py-2 px-4">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {budgets.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <svg className="w-20 h-20 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No Budgets Set</h3>
                    <p className="text-text-muted">Create your first budget to track your spending!</p>
                </div>
            )}
        </div>
    );
};

export default Budgets;
