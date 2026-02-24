import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/login', { email, password });
                    const { access_token, refresh_token, user } = res.data;
                    set({
                        user,
                        token: access_token,
                        refreshToken: refresh_token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return { success: true };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, error: err.response?.data?.error || 'Login failed' };
                }
            },

            register: async (data) => {
                set({ isLoading: true });
                try {
                    const res = await api.post('/auth/register', data);
                    // Registration might just return success message now
                    set({ isLoading: false });
                    return { success: true, message: res.data.message };
                } catch (err) {
                    set({ isLoading: false });
                    return { success: false, error: err.response?.data?.error || 'Registration failed' };
                }
            },

            refreshSession: async () => {
                const { refreshToken } = get();
                if (!refreshToken) return false;
                try {
                    const res = await api.post('/auth/refresh', { refresh_token: refreshToken });
                    const { access_token, refresh_token, user } = res.data;
                    set({
                        user,
                        token: access_token,
                        refreshToken: refresh_token,
                        isAuthenticated: true
                    });
                    return true;
                } catch (err) {
                    get().logout();
                    return false;
                }
            },

            logout: () => {
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
            },

            updateUser: (userData) => set({ user: { ...get().user, ...userData } }),
        }),
        {
            name: 'interviewace-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

export default useAuthStore;
