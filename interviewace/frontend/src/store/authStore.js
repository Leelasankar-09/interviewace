import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/login', { email, password });
                    const { access_token, user } = res.data;
                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    set({ user, token: access_token, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, error: err.response?.data?.detail || 'Login failed' };
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/register', data);
                    const { access_token, user } = res.data;
                    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                    set({ user, token: access_token, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, error: err.response?.data?.detail || 'Registration failed' };
                }
            },

            logout: () => {
                delete api.defaults.headers.common['Authorization'];
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
        }),
        {
            name: 'interviewace-auth',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export default useAuthStore;
