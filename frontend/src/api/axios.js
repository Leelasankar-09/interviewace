import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
});

// Attach token on every request
api.interceptors.request.use((config) => {
    const auth = JSON.parse(localStorage.getItem('interviewace-auth') || '{}');
    const token = auth?.state?.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('interviewace-auth');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
