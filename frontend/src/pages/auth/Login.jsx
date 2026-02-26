import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiGithub } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login(form.email, form.password);
            if (result.success) {
                toast.success('Welcome back to InterviewAce.');
                navigate('/dashboard');
            } else {
                toast.error(result.error);
            }
        } catch (err) {
            toast.error("Internal Server Error");
        }
    };

    const demoLogin = async () => {
        const result = await login('demo@interviewace.com', 'demo123');
        if (result.success) navigate('/dashboard');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 selection:bg-indigo-500/30 overflow-hidden">
            {/* Shifting background mesh */}
            <div className="fixed inset-0 -z-10 bg-[#0a0a0f]">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-full max-w-[440px] glass-morphism p-12 relative z-10"
                style={{
                    background: 'rgba(28, 28, 35, 0.65)',
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mb-4 shadow-xl shadow-indigo-500/20">
                        AI
                    </div>
                    <h1 className="title-section text-white mb-2">Welcome Back</h1>
                    <p className="text-white/40 text-sm font-medium">Continue your path to engineering mastery.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="relative group">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="Email Address"
                                className="w-full input-glass !pl-12 !bg-white/5 !border-white/5 !text-white focus:!border-indigo-500/50"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="relative group">
                            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type={showPwd ? "text" : "password"}
                                required
                                placeholder="Password"
                                className="w-full input-glass !pl-12 !bg-white/5 !border-white/5 !text-white focus:!border-indigo-500/50"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd(!showPwd)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Link to="/forgot-password" size={12} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 group transition-all"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Sign In <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>

                <div className="relative py-8 flex items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-white/20 text-[10px] font-black uppercase tracking-[0.25em]">or continue with</span>
                    <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={demoLogin}
                        className="flex items-center justify-center h-12 glass border border-white/10 rounded-xl font-bold text-white text-xs hover:bg-white/5 transition-all"
                    >
                        🚀 Demo Access
                    </button>
                    <button className="flex items-center justify-center h-12 glass border border-white/10 rounded-xl font-bold text-white text-xs hover:bg-white/5 transition-all gap-2">
                        <FiGithub size={16} /> GitHub
                    </button>
                </div>

                <p className="mt-8 text-center text-white/30 text-sm font-medium">
                    New to InterviewAce? <Link to="/signup" className="text-indigo-400 font-bold hover:underline">Join the Waitlist</Link>
                </p>
            </motion.div>

            {/* Bottom Credits */}
            <div className="fixed bottom-10 left-0 w-full text-center text-[10px] text-white/20 font-black uppercase tracking-[0.35em] pointer-events-none">
                © 2026 InterviewAce · AI Professional Standards
            </div>
        </div>
    );
}
