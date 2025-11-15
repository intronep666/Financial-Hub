import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true;

// Goal category icons
const goalIcons = {
    'Vacation': '✈️',
    'Car': '🚗',
    'House': '🏠',
    'Emergency Fund': '🛡️',
    'Education': '🎓',
    'Laptop': '💻',
    'Phone': '📱',
    'Wedding': '💍',
    'Retirement': '🌴',
    'Investment': '📊',
    'Default': '🎯'
};

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [form, setForm] = useState({ name: '', target_amount: '' });
    const [monthlySavingsRate] = useState(5000); // Mock AI-derived savings rate

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await axios.get(`${API_URL}/goals`);
                console.log('Goals fetched:', response.data);
                setGoals(response.data);
                if (response.data.length > 0) {
                    setSelectedGoal(response.data[0]);
                }
            } catch (error) {
                console.error("Error fetching goals:", error);
                alert('Error loading goals. Please refresh the page.');
            }
        };
        fetchGoals();
    }, []);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validate form
            if (!form.name.trim() || !form.target_amount) {
                alert('Please fill in all required fields');
                return;
            }

            const goalData = {
                name: form.name.trim(),
                target_amount: parseFloat(form.target_amount),
                current_amount: 0
            };

            console.log('Submitting goal:', goalData);
            const response = await axios.post(`${API_URL}/goals`, goalData);
            console.log('Goal created:', response.data);
            
            setGoals((previousGoals) => [response.data, ...previousGoals]);
            if (!selectedGoal) {
                setSelectedGoal(response.data);
            }
            setForm({ name: '', target_amount: '' });
            
            // Haptic feedback
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            alert('Goal added successfully!');
        } catch (error) {
            console.error("Error adding goal:", error);
            console.error("Error response:", error.response?.data);
            
            let errorMessage = 'Failed to add goal. Please try again.';
            if (error.response?.data?.detail) {
                errorMessage = typeof error.response.data.detail === 'string'
                    ? error.response.data.detail
                    : JSON.stringify(error.response.data.detail);
            }
            alert(`Error: ${errorMessage}`);
        }
    };
    const getGoalIcon = (goalName) => {
        const matchedKey = Object.keys(goalIcons).find(key => 
            goalName.toLowerCase().includes(key.toLowerCase())
        );
        return goalIcons[matchedKey] || goalIcons['Default'];
    };

    const enrichedGoals = useMemo(() => {
        return goals.map((goal) => {
            const safeTargetAmount = Math.max(goal.target_amount, 1);
            const actualProgress = ((goal.current_amount || 0) / safeTargetAmount) * 100;
            const remainingAmount = Math.max(0, goal.target_amount - (goal.current_amount || 0));
            const monthsToGoal = Math.ceil(remainingAmount / Math.max(monthlySavingsRate, 1));
            const forecastAmount = (goal.current_amount || 0) + (monthlySavingsRate * 3);
            const forecastProgress = Math.min((forecastAmount / safeTargetAmount) * 100, 100);
            const projectedCompletion = new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000);
            const isOnTrack = monthsToGoal <= 12;

            return {
                ...goal,
                actualProgress,
                forecastProgress,
                monthsToGoal,
                isOnTrack,
                projectedCompletion,
            };
        });
    }, [goals, monthlySavingsRate]);

    const goalsOnTrack = useMemo(() => enrichedGoals.filter((goal) => goal.isOnTrack).length, [enrichedGoals]);
    const totalTargetAmount = useMemo(() => enrichedGoals.reduce((sum, goal) => sum + goal.target_amount, 0), [enrichedGoals]);

    const handleGoalSelection = (goal) => {
        setSelectedGoal(goal);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
            <div>
                <h1 className="text-4xl font-bold text-gradient-primary mb-2">Savings Goals</h1>
                <p className="text-text-muted">Track your progress with AI-powered predictions</p>
            </div>

            <div className="glass-card p-6 max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-success/20 text-success">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-text-primary">Create New Goal</h2>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Goal Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={form.name} 
                            onChange={handleInputChange}
                            placeholder="e.g., Dream Vacation, New Laptop"
                            className="input"
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Target Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted">₹</span>
                            <input 
                                type="number" 
                                name="target_amount" 
                                value={form.target_amount} 
                                onChange={handleInputChange}
                                placeholder="0.00"
                                className="input-financial pl-8"
                                step="0.01"
                                required 
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <button type="submit" className="btn-success w-full sm:w-auto px-8">
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Set Goal</span>
                            </div>
                        </button>
                    </div>
                </form>
            </div>

            {enrichedGoals.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <svg className="w-20 h-20 mx-auto text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No Goals Yet</h3>
                    <p className="text-text-muted">Create your first savings goal to start tracking your progress!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrichedGoals.map(goal => {
                        const isSelected = selectedGoal?.id === goal.id;
                        
                        return (
                            <div
                                key={goal.id}
                                className={`glass-card-hover p-6 space-y-4 transition-all duration-300 focus:outline-none ${isSelected ? 'ring-2 ring-success/70 ring-offset-2 ring-offset-canvas shadow-glow-success' : ''}`}
                                role="button"
                                tabIndex={0}
                                aria-pressed={isSelected}
                                onClick={() => handleGoalSelection(goal)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        handleGoalSelection(goal);
                                    }
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="text-3xl">{getGoalIcon(goal.name)}</span>
                                        <div>
                                            <h3 className="text-xl font-bold text-text-primary">{goal.name}</h3>
                                            <p className="text-sm text-text-muted">
                                                {goal.monthsToGoal} months to go
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`badge ${goal.isOnTrack ? 'badge-success' : 'badge-danger'}`}>
                                        {goal.isOnTrack ? (
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        {goal.isOnTrack ? 'On Track' : 'Behind'}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-2xl font-bold text-gradient-success tabular-nums">
                                            ₹{goal.current_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-sm text-text-muted tabular-nums">
                                            of ₹{goal.target_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-text-muted">
                                        <span>Current Progress</span>
                                        <span className="tabular-nums">{goal.actualProgress.toFixed(1)}%</span>
                                    </div>
                                </div>

                                {/* CRITICAL: AI Risk Assessment Display */}
                                {goal.ai_success_probability && (
                                    <div className={`p-2 rounded-lg text-sm ${
                                        goal.ai_success_probability > 70 
                                            ? 'bg-success/20 text-success' 
                                            : goal.ai_success_probability > 40
                                            ? 'bg-warning/20 text-warning'
                                            : 'bg-danger/20 text-danger'
                                    }`}>
                                        <div className="flex justify-between items-center">
                                            <span>AI Success Probability</span>
                                            <span className="font-bold">{Math.round(goal.ai_success_probability)}%</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="relative h-6 bg-glass-light rounded-full overflow-hidden">
                                        <div 
                                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                                                goal.isOnTrack 
                                                    ? 'bg-success/30' 
                                                    : 'bg-danger/30'
                                            }`}
                                            style={{ width: `${Math.min(goal.forecastProgress, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-slide-right"></div>
                                        </div>

                                        <div 
                                            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                                                goal.isOnTrack 
                                                    ? 'bg-gradient-to-r from-success to-success/80' 
                                                    : 'bg-gradient-to-r from-danger to-danger/80'
                                            }`}
                                            style={{ width: `${Math.min(goal.actualProgress, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                                        </div>

                                        {goal.actualProgress > 15 && (
                                            <div className="absolute inset-0 flex items-center px-3">
                                                <span className="text-xs font-bold text-white tabular-nums">
                                                    {goal.actualProgress.toFixed(0)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-text-muted">
                                            <div className={`w-3 h-3 rounded-sm ${goal.isOnTrack ? 'bg-success/30' : 'bg-danger/30'} border ${goal.isOnTrack ? 'border-success' : 'border-danger'}`}></div>
                                            <span>3-month forecast</span>
                                        </div>
                                        <span className={`font-medium tabular-nums ${goal.isOnTrack ? 'text-success' : 'text-danger'}`}>
                                            {goal.forecastProgress.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className={`p-3 rounded-lg ${goal.isOnTrack ? 'bg-success/10' : 'bg-danger/10'}`}>
                                    <div className="flex items-start gap-2">
                                        {goal.isOnTrack ? (
                                            <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                            </svg>
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-xs font-medium ${goal.isOnTrack ? 'text-success' : 'text-danger'}`}>
                                                {goal.isOnTrack ? 'Great Progress!' : 'Need Boost'}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {goal.isOnTrack 
                                                    ? `Projected completion: ${goal.projectedCompletion.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                                                    : `Increase savings to ₹${Math.ceil((goal.target_amount - goal.current_amount) / 12).toLocaleString()}/month`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button className="btn-outline flex-1 text-sm py-2">
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Funds
                                    </button>
                                    <button className="btn-glass text-sm py-2 px-4">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {enrichedGoals.length > 0 && (
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-text-primary">AI Insights</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-lg glass-bg">
                            <p className="text-sm text-text-muted mb-1">Monthly Savings Rate</p>
                            <p className="text-2xl font-bold text-gradient-primary tabular-nums">
                                ₹{monthlySavingsRate.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg glass-bg">
                            <p className="text-sm text-text-muted mb-1">Goals On Track</p>
                            <p className="text-2xl font-bold text-gradient-success tabular-nums">
                                {goalsOnTrack}/{enrichedGoals.length}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg glass-bg">
                            <p className="text-sm text-text-muted mb-1">Total Target</p>
                            <p className="text-2xl font-bold text-text-primary tabular-nums">
                                ₹{totalTargetAmount.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Goals;
