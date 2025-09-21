import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [form, setForm] = useState({ name: '', target_amount: '' });
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const response = await axios.get(`${API_URL}/goals`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setGoals(response.data);
            } catch (error) {
                console.error("Error fetching goals:", error);
            }
        };
        fetchGoals();
    }, [token]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/goals`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGoals([response.data, ...goals]);
            setForm({ name: '', target_amount: '' });
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    return (
        <div>
            {/* Add Goal Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Create a New Savings Goal</h2>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                    <input type="text" name="name" value={form.name} onChange={handleInputChange}
                           placeholder="Goal Name (e.g., New Laptop)"
                           className="flex-grow mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    <input type="number" name="target_amount" value={form.target_amount} onChange={handleInputChange}
                           placeholder="Target Amount (₹)"
                           className="flex-grow mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                    <button type="submit"
                            className="py-2 px-6 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                        Set Goal
                    </button>
                </form>
            </div>

            {/* Goals List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map(goal => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    return (
                        <div key={goal.id} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold text-gray-800">{goal.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                                Saved ₹{goal.current_amount.toFixed(2)} of ₹{goal.target_amount.toFixed(2)}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div className="bg-green-500 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                            <p className="text-right text-sm font-semibold mt-1">{progress.toFixed(1)}%</p>
                        </div>
                    );
                })}
            </div>
             {goals.length === 0 && <p className="text-center text-gray-500 py-10">You haven't set any goals yet. Create one above to get started!</p>}
        </div>
    );
};

export default Goals;
