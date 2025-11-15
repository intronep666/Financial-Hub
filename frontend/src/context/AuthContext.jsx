import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`);
            setUser(response.data);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            // Send credentials as form data (OAuth2 format)
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            await axios.post(
                `${API_URL}/auth/token`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            // Cookie is set automatically by backend
            // Now verify authentication
            await checkAuth();

            return { success: true, message: 'Login successful' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.detail || error.message || 'Login failed'
            };
        }
    };

    const register = async (username, password, email) => {
        try {
            await axios.post(`${API_URL}/auth/register`, {
                username,
                password,
                email
            });

            return {
                success: true,
                message: 'Registration successful! Please login.'
            };
        } catch (error) {
            let errorMessage = 'Registration failed';
            
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Axios interceptor for handling 401 errors
    useEffect(() => {
        // BUG FIX #12: Create unique interceptor ID to properly track
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Session expired, logout user
                    setUser(null);
                    setIsAuthenticated(false);
                }
                return Promise.reject(error);
            }
        );

        // Properly clean up interceptor on unmount
        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
