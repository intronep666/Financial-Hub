import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [form, setForm] = useState({
        name: '',
        amount: '',
        paid: '0',
        type: 'borrowed',
        date_taken: new Date().toISOString().slice(0, 10),
        source: ''
    });
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchLoans = async () => {
            try {
                const response = await axios.get(`${API_URL}/loans`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLoans(response.data);
            } catch (error) {
                console.error("Error fetching loans:", error);
            }
        };
        fetchLoans();
    }, [token]);

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/loans`, form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLoans([response.data, ...loans]);
            // Reset form
            setForm({ name: '', amount: '', paid: '0', type: 'borrowed', date_taken: new Date().toISOString().slice(0, 10), source: '' });
        } catch (error) {
            console.error("Error adding loan:", error);
        }
    };

    const borrowedLoans = loans.filter(l => l.type === 'borrowed');
    const lentLoans = loans.filter(l => l.type === 'lent');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Loan Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Add Loan / Debt</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Person/Source</label>
                            <input type="text" name="name" value={form.name} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                            <input type="number" name="amount" value={form.amount} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select name="type" value={form.type} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                                <option value="borrowed">I Borrowed</option>
                                <option value="lent">I Lent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" name="date_taken" value={form.date_taken} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Add Record</button>
                    </form>
                </div>
            </div>

            {/* Loan Lists */}
            <div className="lg:col-span-2 space-y-8">
                {/* Borrowed Loans */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Money You Owe</h2>
                    <LoanTable loans={borrowedLoans} />
                </div>
                {/* Lent Loans */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">Money Owed to You</h2>
                    <LoanTable loans={lentLoans} />
                </div>
            </div>
        </div>
    );
};

// A helper component to render the loan tables to avoid repetition
const LoanTable = ({ loans }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">From/To</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {loans.map(loan => (
                    <tr key={loan.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{loan.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">₹{loan.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-orange-600">₹{loan.remaining.toFixed(2)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(loan.date_taken).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        {loans.length === 0 && <p className="text-center text-gray-500 py-4">No records yet.</p>}
    </div>
);

export default Loans;
