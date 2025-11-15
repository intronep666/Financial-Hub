import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        // BUG FIX #7: Add email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }
        
        // Validate username length
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            setLoading(false);
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        
        try {
            const result = await register(username, password, email);
            
            if (result.success) {
                setSuccess('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('Connection error. Please check your network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-success rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-warning rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="glass-card p-8 space-y-6">
                    <div className="text-center space-y-4">
                        <div className="inline-block p-6 rounded-3xl bg-gradient-success shadow-glow-success animate-glow">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-gradient-success mb-2">
                                Join Kryptos Finance
                            </h1>
                            <p className="text-sm font-semibold">
                                <span className="text-text-primary">Kryptos Finance</span>
                                <span className="text-text-muted"> – by Intronep</span>
                            </p>
                            <p className="text-text-secondary text-sm">
                                ✨ Start Your Journey to Financial Freedom
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input pl-12"
                                    placeholder="Choose a username"
                                    required 
                                    disabled={loading}
                                    autoComplete="username"
                                    minLength="3"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-12"
                                    placeholder="your.email@example.com"
                                    required 
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-12"
                                    placeholder="Create a strong password"
                                    required 
                                    disabled={loading}
                                    autoComplete="new-password"
                                    minLength="6"
                                />
                            </div>
                            <p className="text-xs text-text-muted">Minimum 6 characters</p>
                        </div>

                        {error && (
                            <div className="alert-danger animate-slide-down">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-danger">{error}</p>
                                </div>
                            </div>
                        )}

                        {success && (
                            <div className="alert-success animate-slide-down">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-success">{success}</p>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            className="btn-success w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>Create Account</span>
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-glass-light"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-canvas-light text-text-muted">Already a member?</span>
                        </div>
                    </div>

                    <Link 
                        to="/login" 
                        className="btn-outline w-full block text-center"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign In</span>
                        </div>
                    </Link>

                    <div className="text-center pt-4 border-t border-glass-light">
                        <p className="text-xs text-text-muted">
                            By signing up, you agree to our Terms of Service and Privacy Policy. 
                            Your data is encrypted and secure.
                        </p>
                    </div>
                </div>

                <div className="h-1 mt-4 rounded-full bg-gradient-success opacity-50"></div>
            </div>
        </div>
    );
};

export default Register;