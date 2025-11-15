import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const result = await login(username, password);
            
            if (result.success) {
                // BUG FIX #5: Clear form fields on successful login (security)
                setUsername('');
                setPassword('');
                
                // CRITICAL FIX: Add a small delay to ensure cookie is fully set
                // before navigating to dashboard (prevents race condition)
                await new Promise(resolve => setTimeout(resolve, 100));
                
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid credentials. Please try again.');
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
                <div className="absolute top-0 -left-4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-success rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-danger rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow animation-delay-4000"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="glass-card p-8 space-y-6">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl overflow-hidden shadow-glow-primary ring-2 ring-primary/40 animate-glow">
                            <img
                                src="/kryptos-logo.png"
                                alt="Kryptos Finance crest"
                                className="h-full w-full object-cover"
                                decoding="async"
                                loading="lazy"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-text-primary">
                                Kryptos Finance
                            </h1>
                            <p className="text-base font-semibold">
                                <span className="text-text-primary">Kryptos Finance</span>
                                <span className="text-text-muted"> – by Intronep</span>
                            </p>
                            <p className="text-text-secondary text-sm">
                                🔒 Secure Biometric Access • Bank-Level Security
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">
                                Username
                            </label>
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
                                    placeholder="Enter your username"
                                    required 
                                    disabled={loading}
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-text-secondary">
                                Password
                            </label>
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
                                    placeholder="Enter your password"
                                    required 
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                            </div>
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

                        <button 
                            type="submit"
                            className="btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span>Secure Login</span>
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-glass-light"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-canvas-light text-text-muted">New to Kryptos Finance?</span>
                        </div>
                    </div>

                    <Link 
                        to="/register" 
                        className="btn-outline w-full block text-center"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Create Account</span>
                        </div>
                    </Link>

                    <div className="text-center pt-4 border-t border-glass-light">
                        <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>256-bit Encryption • 2FA Ready • httpOnly Cookies</span>
                        </div>
                    </div>
                </div>

                <div className="h-1 mt-4 rounded-full bg-gradient-primary opacity-50"></div>
            </div>
        </div>
    );
};

export default Login;