// --- frontend/src/components/Dashboard.js ---
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = 'http://localhost:8000';

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Fetch Summary Data
        axios.get(`${API_URL}/summary`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => setSummary(response.data))
            .catch(error => console.error("Error fetching summary:", error));

        // Fetch Chart Data
        axios.get(`${API_URL}/charts/expense-by-category`, { headers: { Authorization: `Bearer ${token}` } })
            .then(response => {
                const data = {
                    labels: response.data.map(d => d.category),
                    datasets: [{
                        data: response.data.map(d => d.total),
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
                    }]
                };
                setChartData(data);
            })
            .catch(error => console.error("Error fetching chart data:", error));
    }, [token]);

    if (!summary) return <div className="text-center">Loading...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-800">Welcome Back! 👋</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-green-800">Total Income</h2>
                    <p className="text-3xl font-bold text-green-600">₹{summary.total_income.toFixed(2)}</p>
                </div>
                <div className="bg-red-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-red-800">Total Expense</h2>
                    <p className="text-3xl font-bold text-red-600">₹{summary.total_expense.toFixed(2)}</p>
                </div>
                 <div className="bg-blue-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold text-blue-800">Current Balance</h2>
                    <p className="text-3xl font-bold text-blue-600">₹{summary.balance.toFixed(2)}</p>
                </div>
            </div>

            {/* Charts and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Expense Breakdown</h2>
                    {chartData && chartData.labels.length > 0 ? (
                        <Doughnut data={chartData} />
                    ) : (
                        <p className="text-gray-500">No expense data to display yet.</p>
                    )}
                </div>
                {/* Future: Quick Actions like Add Expense/Income */}
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                     <h2 className="text-2xl font-bold text-gray-700">Loan Summary</h2>
                      <div className="bg-orange-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-800">Total Debt (You Owe)</h3>
                        <p className="text-2xl font-bold text-orange-600">₹{summary.total_debt.toFixed(2)}</p>
                    </div>
                     <div className="bg-indigo-100 p-4 rounded-lg">
                        <h3 className="font-semibold text-indigo-800">Total Lent (Owed to You)</h3>
                        <p className="text-2xl font-bold text-indigo-600">₹{summary.total_lent_outstanding.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;