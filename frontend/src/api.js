import axios from 'axios';

const runtimeApiUrl = typeof window !== 'undefined' && window.__RUNTIME_CONFIG__?.VITE_API_URL;
const API_BASE_URL =
  runtimeApiUrl ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      const method = config.method?.toUpperCase() || 'GET';
      console.info(`[API] ${method} ${config.baseURL ?? ''}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      if (status >= 500) {
        console.error('[API] Server error:', status, error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;
