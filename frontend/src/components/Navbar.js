import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="bg-gray-800 p-4 shadow-lg fixed top-0 left-0 w-full z-10">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-xl font-bold">FinanceTracker</div>
                <div className="flex items-center space-x-4">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-indigo-400" : "text-gray-300 hover:text-white"}>Dashboard</NavLink>
                    <NavLink to="/transactions" className={({ isActive }) => isActive ? "text-indigo-400" : "text-gray-300 hover:text-white"}>Transactions</NavLink>
                    <NavLink to="/loans" className={({ isActive }) => isActive ? "text-indigo-400" : "text-gray-300 hover:text-white"}>Loans</NavLink>
                    <NavLink to="/goals" className={({ isActive }) => isActive ? "text-indigo-400" : "text-gray-300 hover:text-white"}>Goals</NavLink>
                    <button onClick={handleLogout} className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Logout</button>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;