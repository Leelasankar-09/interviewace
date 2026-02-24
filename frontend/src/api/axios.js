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

// Handle 401 globally with refresh logic
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Logic to trigger refreshSession from AuthStore
            try {
                // Dynamically import to avoid circular dependency
                const { default: useAuthStore } = await import('../store/authStore');
                const refreshed = await useAuthStore.getState().refreshSession();

                if (refreshed) {
                    const newToken = useAuthStore.getState().token;
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshErr) {
                console.error("Session refresh failed", refreshErr);
            }

            // If refresh fails, final logout
            const { default: useAuthStore } = await import('../store/authStore');
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
