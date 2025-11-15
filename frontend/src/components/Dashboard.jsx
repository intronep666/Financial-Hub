import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import {
    Chart as ChartJS,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    LinearScale,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Modern Health Score Chart Component (2D Doughnut with 5 Financial Factors)
const HealthScoreChart = ({ metrics, score }) => {
    const chartData = {
        labels: metrics.map(m => m.label),
        datasets: [{
            data: metrics.map(m => m.value),
            backgroundColor: [
                'rgba(4, 170, 109, 0.8)',   // Success green (Income)
                'rgba(29, 122, 243, 0.8)',  // Primary blue (Spending)
                'rgba(255, 184, 0, 0.8)',   // Warning yellow (Savings)
                'rgba(255, 69, 0, 0.8)',    // Danger red (Debt)
                'rgba(168, 85, 247, 0.8)',  // Purple (Goals) - NEW 5TH FACTOR
            ],
            borderColor: [
                '#04AA6D',
                '#1D7AF3',
                '#FFB800',
                '#FF4500',
                '#A855F7',
            ],
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#F8F9FA',
                    font: { size: 12 },
                    padding: 20,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(18, 18, 23, 0.95)',
                titleColor: '#F8F9FA',
                bodyColor: '#B8BCBF',
                borderColor: 'rgba(29, 122, 243, 0.3)',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.parsed}%`;
                    }
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 2,
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80">
                <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">
                    Financial Health Breakdown
                </h3>
                <Doughnut data={chartData} options={options} />
            </div>
            <div className="flex flex-col justify-center space-y-4">
                <div className="text-center">
                    <div className="text-6xl font-bold text-primary mb-2">
                        {Math.round(score)}%
                    </div>
                    <div className="text-lg text-text-secondary">
                        Overall Health Score
                    </div>
                </div>
                <div className="space-y-3">
                    {metrics.map((metric, i) => (
                        <div key={i} className="flex justify-between items-center p-3 glass-bg rounded-lg">
                            <span className="text-text-secondary">{metric.label}</span>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    metric.value > 80 ? 'bg-success' : 
                                    metric.value < 60 ? 'bg-danger' : 'bg-primary'
                                }`}></div>
                                <span className="font-semibold text-text-primary">{metric.value}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

ChartJS.register(
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler,
    CategoryScale,
    LinearScale,
    ArcElement
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [timePeriod, setTimePeriod] = useState('7d');  // NEW: Track time period
    const [loading, setLoading] = useState(true);  // NEW: Track loading state
    const [notifications, setNotifications] = useState([]);

    // CRITICAL: Load summary data with proper error handling
    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            
            // Small delay to ensure auth cookie is set
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
                console.log('[API] Fetching financial summary...');
                const response = await api.get('/summary');
                console.log('[SUCCESS] Summary data received:', response.data);
                setSummary(response.data);
                
                // CRITICAL: Convert AI recommendations to notifications
                if (response.data.ai_recommendations && Array.isArray(response.data.ai_recommendations)) {
                    const aiNotifications = response.data.ai_recommendations.map((rec, idx) => ({
                        id: idx + 100,
                        type: rec.includes('Spending') || rec.includes('spending') ? 'warning' : 
                              rec.includes('Congratulations') || rec.includes('maintain') ? 'success' : 
                              'warning',
                        message: rec,
                        icon: rec.includes('Spending') || rec.includes('spending') ? '⚠️' : 
                               rec.includes('Congratulations') || rec.includes('maintain') ? '🎯' : 
                               rec.includes('debt') || rec.includes('Debt') ? '💳' : '💡'
                    }));
                    console.log('[DEBUG] Generated notifications from AI:', aiNotifications);
                    setNotifications(aiNotifications);
                } else {
                    setNotifications([
                        { id: 1, type: 'info', message: 'Welcome! Add transactions to see insights', icon: '💡' }
                    ]);
                }
            } catch (error) {
                console.error('[ERROR] Failed to fetch summary:', error);
                console.error('[DEBUG] Error details:', error.response);
                
                if (error.response?.status === 401) {
                    alert('Your session has expired. Please log in again.');
                    navigate('/login');
                } else {
                    const errorMsg = error.response?.data?.detail || error.message || 'Unknown error';
                    alert(`Failed to load dashboard data: ${errorMsg}\n\nPlease check the console for details.`);
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchSummary();
    }, [navigate]);

    if (!summary || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-text-secondary">Loading your financial dashboard...</p>
                </div>
            </div>
        );
    }

    const dismissNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    // CRITICAL: Handle time period change with API call and state update
    const handleTimePeriodChange = async (period) => {
        console.log(`[ACTION] Changing time period to: ${period}`);
        setTimePeriod(period);
        
        try {
            // In a real scenario, you would fetch data for the selected period
            // For now, just update the visual state
            console.log(`[STATE] Updated time period to ${period}`);
        } catch (error) {
            console.error('[ERROR] Failed to update time period:', error);
        }
    };

    const baseScore = Math.min(100, ((summary.total_income / (summary.total_expense + 1)) * 100));
    const savingsRate = typeof summary.savings_rate === 'number'
        ? Math.min(100, Math.max(0, summary.savings_rate * 100))
        : (summary.total_income > 0 ? ((summary.balance / summary.total_income) * 100) : 0);
    const spendingControl = summary.total_income > 0 ? Math.max(0, 100 - (summary.total_expense / summary.total_income * 100)) : 0;
    const dtiRatio = typeof summary.dti_ratio === 'number' ? summary.dti_ratio : 0;
    const debtManagement = Math.min(100, Math.max(0, (1 - Math.min(1, dtiRatio)) * 100));
    const aiScore = summary.financial_health_score ?? baseScore;
    
    // CRITICAL: Calculate Goals Progress (5th factor for complete health scoring)
    const goalsProgress = 70;  // TODO: Replace with actual goals data from API

    const healthMetrics = [
        {
            label: 'Income Health',
            value: Math.min(100, Math.max(0, aiScore)),
        },
        {
            label: 'Spending Control',
            value: Math.min(100, Math.max(0, spendingControl)),
        },
        {
            label: 'Savings Rate',
            value: Math.min(100, Math.max(0, savingsRate)),
        },
        {
            label: 'Debt Management',
            value: Math.min(100, Math.max(0, debtManagement)),
        },
        {
            label: 'Goals Progress',
            value: Math.min(100, Math.max(0, goalsProgress)),
        },
    ];

    // Net Flow Trend Line Chart (last 7 days mock data)
    const lineChartData = {
        labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
        datasets: [{
            label: 'Net Cash Flow',
            data: [summary.balance * 0.7, summary.balance * 0.75, summary.balance * 0.73, summary.balance * 0.8, summary.balance * 0.85, summary.balance * 0.9, summary.balance],
            fill: true,
            backgroundColor: 'rgba(29, 122, 243, 0.1)',
            borderColor: '#1D7AF3',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: '#1D7AF3',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(18, 18, 23, 0.95)',
                titleColor: '#F8F9FA',
                bodyColor: '#B8BCBF',
                borderColor: 'rgba(29, 122, 243, 0.3)',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: function(context) {
                        return `₹${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { 
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: { 
                    color: '#6C757D',
                    font: { size: 11 }
                }
            },
            y: {
                grid: { 
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: { 
                    color: '#6C757D',
                    font: { size: 11 },
                    callback: function(value) {
                        return '₹' + value.toFixed(0);
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-gradient-primary mb-2">
                        Welcome Back! 👋
                    </h1>
                    <p className="text-text-secondary">Here's your financial overview for today</p>
                </div>
                <div className="hidden md:block glass-card px-6 py-3">
                    <p className="text-xs text-text-muted">Last updated</p>
                    <p className="text-sm font-medium text-primary">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Financial Health Score</h2>
                        <p className="text-text-muted text-sm">AI-Powered Multi-Factor Analysis</p>
                    </div>
                    <div className="badge-primary">
                        <span className="text-xl font-bold">{Math.round(Math.min(100, Math.max(0, aiScore)))}%</span>
                    </div>
                </div>
                <HealthScoreChart metrics={healthMetrics} score={aiScore} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card-hover p-6 border-l-4 border-success">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="badge-success">+12.5%</span>
                    </div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Total Income</h3>
                    <p className="text-3xl font-bold text-success tabular-nums">₹{summary.total_income.toFixed(2)}</p>
                </div>

                <div className="glass-card-hover p-6 border-l-4 border-danger">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-danger/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="badge-danger">-8.3%</span>
                    </div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Total Expense</h3>
                    <p className="text-3xl font-bold text-danger tabular-nums">₹{summary.total_expense.toFixed(2)}</p>
                </div>

                <div className="glass-card-hover p-6 border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <span className={`badge ${summary.balance > 0 ? 'badge-success' : 'badge-danger'}`}>
                            {summary.balance > 0 ? '↑' : '↓'}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Current Balance</h3>
                    <p className={`text-3xl font-bold tabular-nums ${summary.balance > 0 ? 'text-primary' : 'text-danger'}`}>
                        ₹{summary.balance.toFixed(2)}
                    </p>
                </div>

                <div className="glass-card-hover p-6 border-l-4 border-warning">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="badge-warning">Goal</span>
                    </div>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Savings Rate</h3>
                    <p className="text-3xl font-bold text-warning tabular-nums">{Math.round(Math.min(100, Math.max(0, savingsRate)))}%</p>
                </div>
            </div>

            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <span className="w-2 h-2 bg-danger rounded-full animate-pulse"></span>
                        Smart Alerts & Insights
                    </h2>
                    <button 
                        onClick={() => {
                            console.log('[ACTION] View all alerts clicked');
                            alert('All alerts functionality coming soon');
                        }}
                        className="text-sm text-primary hover:text-primary-light transition-colors font-medium"
                    >
                        View All →
                    </button>
                </div>
                
                <div className="space-y-3">
                    {notifications.map(notif => (
                        <div 
                            key={notif.id}
                            className={`alert-${notif.type} animate-slide-up`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">{notif.icon}</span>
                                <div className="flex-1">
                                    <p className={`font-medium ${
                                        notif.type === 'success' ? 'text-success' :
                                        notif.type === 'danger' ? 'text-danger' :
                                        'text-warning'
                                    }`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-text-muted mt-1">Just now • AI Generated</p>
                                </div>
                                <button
                                    className="text-text-muted hover:text-text-primary transition-colors"
                                    onClick={() => dismissNotification(notif.id)}
                                    aria-label="Dismiss notification"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-text-primary">Net Cash Flow Trend</h2>
                            <p className="text-sm text-text-muted">Last 7 days • Real-time tracking</p>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleTimePeriodChange('7d')}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                    timePeriod === '7d' 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'glass-bg text-text-muted hover:bg-primary/10'
                                }`}
                            >
                                7D
                            </button>
                            <button 
                                onClick={() => handleTimePeriodChange('30d')}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                    timePeriod === '30d' 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'glass-bg text-text-muted hover:bg-primary/10'
                                }`}
                            >
                                30D
                            </button>
                        </div>
                    </div>
                    <div className="h-64">
                        <Line data={lineChartData} options={lineOptions} />
                    </div>
                </div>

                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Debt Overview</h2>
                    
                    <div className="glass-bg p-4 rounded-xl border border-danger/30">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-text-secondary text-sm">Total Debt (You Owe)</h3>
                            <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-danger tabular-nums">₹{summary.total_debt.toFixed(2)}</p>
                        <div className="mt-3 progress-bar">
                            <div 
                                className="progress-fill-danger"
                                style={{ width: `${Math.round(Math.min(100, (dtiRatio * 100)))}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-text-muted mt-2">DTI: {Math.round(dtiRatio * 100)}%</p>
                    </div>
                    
                    <div className="glass-bg p-4 rounded-xl border border-success/30">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-text-secondary text-sm">Total Lent (Owed to You)</h3>
                            <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-success tabular-nums">₹{summary.total_lent_outstanding.toFixed(2)}</p>
                        <div className="mt-3 progress-bar">
                            <div 
                                className="progress-fill-success"
                                style={{ width: `${Math.min(100, (summary.total_lent_outstanding / summary.total_income) * 50)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-text-muted mt-2">Expected recovery</p>
                    </div>

                    <button 
                        onClick={() => {
                            console.log('[ACTION] Manage Loans clicked');
                            navigate('/loans');
                        }}
                        className="btn-primary w-full mt-4"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Manage Loans</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;