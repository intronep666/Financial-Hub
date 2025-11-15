import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Loans from './components/Loans';
import Goals from './components/Goals';
import Budgets from './components/Budgets';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-canvas min-h-screen text-text-primary">
            {isAuthenticated && <Navbar />}
            <main className="pt-20">
                <div className="container mx-auto p-4">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route 
                            path="/dashboard" 
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/transactions" 
                            element={
                                <ProtectedRoute>
                                    <Transactions />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/loans" 
                            element={
                                <ProtectedRoute>
                                    <Loans />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/goals" 
                            element={
                                <ProtectedRoute>
                                    <Goals />
                                </ProtectedRoute>
                            } 
                        />
                        <Route 
                            path="/budgets" 
                            element={
                                <ProtectedRoute>
                                    <Budgets />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
