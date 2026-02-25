// src/hooks/useAuth.js
import useAuthStore from '../store/authStore';
import * as authApi from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function useAuth() {
    const { user, login: setLogin, logout: setLogout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (credentials) => {
        try {
            const res = await authApi.login(credentials);
            setLogin(res.data.user, res.data.access_token);
            toast.success("Welcome back!");
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.detail || "Login failed");
            throw err;
        }
    };

    const handleRegister = async (data) => {
        try {
            await authApi.register(data);
            toast.success("Account created! Please login.");
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.detail || "Registration failed");
            throw err;
        }
    };

    const handleLogout = () => {
        setLogout();
        navigate('/login');
    };

    return {
        user,
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout
    };
}
