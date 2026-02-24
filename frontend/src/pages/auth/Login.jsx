import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiShield, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form.email, form.password);
        if (result.success) {
            toast.success('Welcome back to your career journey.');
            navigate('/dashboard');
        } else {
            toast.error(result.error);
        }
    };

    const demoLogin = async () => {
        const result = await login('demo@interviewace.com', 'demo123');
        if (result.success) navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-background flex overflow-hidden font-sans">
            {/* Left Side: Motivational Branding */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 bg-slate-900 relative p-16 flex-col justify-between text-white"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-2xl font-serif font-black tracking-tight mb-12">
                        <span className="text-terracotta">🎯</span> InterviewAce
                    </div>

                    <div className="max-w-md space-y-6">
                        <h1 className="text-5xl font-serif leading-tight">
                            Your path to <span className="text-terracotta italic">excellence</span> starts here.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Join over 10,000+ candidates who have leveled up their interview performance with our human-centered AI coaching.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { icon: FiCheckCircle, title: "12-PT Evaluation", desc: "Deep behavioral analysis" },
                            { icon: FiShield, title: "Private & Secure", desc: "Your data is encrypted" },
                            { icon: FiTrendingUp, title: "Progressive Learning", desc: "Adaptive study paths" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-3">
                                <div className="mt-1 text-terracotta"><item.icon size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-sm">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-800 flex items-center gap-4 text-xs text-slate-500">
                        <span className="uppercase tracking-[0.2em] font-bold">Trusted by builders at</span>
                        <div className="flex gap-6 grayscale opacity-40 invert font-black italic text-lg tracking-tighter">
                            <span>Google</span> <span>Meta</span> <span>Amazon</span>
                        </div>
                    </div>
                </div>

                {/* Abstract shape */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] border-[40px] border-terracotta rounded-full blur-[120px]" />
                </div>
            </motion.div>

            {/* Right Side: Professional Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-1 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-background"
            >
                <div className="max-w-md w-full mx-auto space-y-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-serif text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 font-medium tracking-tight">Enter your credentials to access your dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group relative">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 block group-focus-within:text-terracotta transition-colors">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-terracotta transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="name@company.com"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-terracotta/5 focus:border-terracotta/20 transition-all font-medium"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-focus-within:text-terracotta transition-colors">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" size={12} className="text-[10px] font-bold text-terracotta hover:text-orange-800 transition-colors uppercase tracking-widest">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-terracotta transition-colors" />
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-white border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-terracotta/5 focus:border-terracotta/20 transition-all font-medium"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                    >
                                        {showPwd ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-terracotta text-white font-bold py-4 rounded-2xl shadow-xl shadow-terracotta/20 hover:bg-orange-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex justify-center items-center"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Sign in to Dashboard"
                            )}
                        </button>
                    </form>

                    <div className="relative py-4 flex items-center">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest">or continue with</span>
                        <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={demoLogin}
                            className="flex items-center justify-center gap-2 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            🚀 Demo Account
                        </button>
                        <button className="flex items-center justify-center gap-2 py-4 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" /></svg>
                            GitHub
                        </button>
                    </div>

                    <p className="text-center text-slate-500 text-sm">
                        New to InterviewAce? <Link to="/signup" className="text-terracotta font-bold hover:underline">Start for free</Link>
                    </p>
                </div>

                <div className="mt-auto pt-16 text-center text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                    © 2026 InterviewAce · Professional Interview Coaching
                </div>
            </motion.div>
        </div>
    );
}
