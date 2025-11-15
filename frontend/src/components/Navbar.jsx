import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="glass-bg border-b border-glass-light backdrop-blur-xl fixed top-0 left-0 w-full z-50 shadow-elevated">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-glow-primary ring-1 ring-primary/40">
                            <img
                                src="/kryptos-logo.png"
                                alt="Kryptos Finance logo"
                                className="h-full w-full object-cover"
                                decoding="async"
                                loading="lazy"
                            />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-primary tracking-tight">
                                Kryptos Finance
                            </h1>
                            <p className="text-xs text-text-muted hidden sm:block uppercase tracking-[0.2em]">
                                by Intronep
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary shadow-glow-primary' 
                                        : 'text-text-secondary hover:text-primary hover:bg-glass-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Dashboard</span>
                            </div>
                        </NavLink>
                        
                        <NavLink 
                            to="/transactions" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary shadow-glow-primary' 
                                        : 'text-text-secondary hover:text-primary hover:bg-glass-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>Transactions</span>
                            </div>
                        </NavLink>
                        
                        <NavLink 
                            to="/loans" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary shadow-glow-primary' 
                                        : 'text-text-secondary hover:text-primary hover:bg-glass-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Loans</span>
                            </div>
                        </NavLink>
                        
                        <NavLink 
                            to="/goals" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary shadow-glow-primary' 
                                        : 'text-text-secondary hover:text-primary hover:bg-glass-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <span>Goals</span>
                            </div>
                        </NavLink>

                        <NavLink 
                            to="/budgets" 
                            className={({ isActive }) => 
                                `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary shadow-glow-primary' 
                                        : 'text-text-secondary hover:text-primary hover:bg-glass-light'
                                }`
                            }
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span>Budgets</span>
                            </div>
                        </NavLink>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {user && (
                            <div className="flex items-center gap-3 px-4 py-2 rounded-lg glass-bg">
                                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-glow-primary">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-text-primary">{user.username}</span>
                                    <span className="text-xs text-text-muted">Premium Member</span>
                                </div>
                            </div>
                        )}
                        
                        <button 
                            onClick={handleLogout} 
                            className="btn-outline px-4 py-2"
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </div>
                        </button>
                    </div>

                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg glass-bg hover:bg-glass-light transition-colors"
                    >
                        <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 animate-slide-down border-t border-glass-light mt-2">
                        <NavLink 
                            to="/dashboard" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `block px-4 py-3 rounded-lg font-medium transition-all ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'text-text-secondary hover:bg-glass-light'
                                }`
                            }
                        >
                            Dashboard
                        </NavLink>
                        <NavLink 
                            to="/transactions" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `block px-4 py-3 rounded-lg font-medium transition-all ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'text-text-secondary hover:bg-glass-light'
                                }`
                            }
                        >
                            Transactions
                        </NavLink>
                        <NavLink 
                            to="/loans" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `block px-4 py-3 rounded-lg font-medium transition-all ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'text-text-secondary hover:bg-glass-light'
                                }`
                            }
                        >
                            Loans
                        </NavLink>
                        <NavLink 
                            to="/goals" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `block px-4 py-3 rounded-lg font-medium transition-all ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'text-text-secondary hover:bg-glass-light'
                                }`
                            }
                        >
                            Goals
                        </NavLink>

                        <NavLink 
                            to="/budgets" 
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) => 
                                `block px-4 py-3 rounded-lg font-medium transition-all ${
                                    isActive 
                                        ? 'bg-primary/20 text-primary' 
                                        : 'text-text-secondary hover:bg-glass-light'
                                }`
                            }
                        >
                            Budgets
                        </NavLink>
                        
                        {user && (
                            <div className="px-4 py-3 glass-bg rounded-lg">
                                <span className="text-sm text-text-secondary">Logged in as</span>
                                <p className="font-medium text-text-primary">{user.username}</p>
                            </div>
                        )}
                        
                        <button 
                            onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                            }}
                            className="w-full btn-outline"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;