import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Loans from './components/Loans';
import Goals from './components/Goals';
import Navbar from './components/Navbar';

function App() {
    const token = localStorage.getItem('token');

    return (
        <Router>
            <div className="bg-gray-50 min-h-screen">
                {token && <Navbar />}
                <main className="pt-20"> {/* Padding to avoid content being hidden by fixed navbar */}
                    <div className="container mx-auto p-4">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
                            <Route path="/transactions" element={token ? <Transactions /> : <Navigate to="/login" />} />
                            <Route path="/loans" element={token ? <Loans /> : <Navigate to="/login" />} />
                            <Route path="/goals" element={token ? <Goals /> : <Navigate to="/login" />} />
                            {/* This is a catch-all route that redirects users */}
                            <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </Router>
    );
}

export default App;
