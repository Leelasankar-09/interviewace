import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend
} from 'recharts';
import {
    FiCode, FiMic, FiLayers, FiFileText, FiTrendingUp, FiAward,
    FiZap, FiActivity, FiSearch, FiCheckCircle, FiClock, FiPlus,
    FiChevronRight, FiTrendingDown, FiTarget
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import axios from '../api/axios';

const COLORS = ['#c2410c', '#ea580c', '#fb923c', '#fdba74', '#fed7aa', '#7c2d12'];

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ overall_score: 0, problems_solved: 0, ats_score: 0, current_streak: 0 });
    const [readiness, setReadiness] = useState({ overall_readiness: 0, recommendations: [] });
    const [streakData, setStreakData] = useState([]);
    const [activity, setActivity] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, streakRes, activityRes, chartRes, readinessRes] = await Promise.all([
                    axios.get('/api/dashboard/stats'),
                    axios.get('/api/dashboard/streak'),
                    axios.get('/api/dashboard/activity'),
                    axios.get('/api/dashboard/charts'),
                    axios.get('/api/prep/readiness')
                ]);
                setStats(statsRes.data);
                setStreakData(streakRes.data);
                setActivity(activityRes.data);
                setChartData(chartRes.data);
                setReadiness(readinessRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
        })
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 bg-background min-h-screen">

            {/* --- Hero Header --- */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-white p-10 rounded-[2.5rem] shadow-soft border border-stone-100 relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-2 text-terracotta font-serif italic text-lg leading-none">
                        <FiTarget /> {readiness.overall_readiness > 70 ? 'You are doing great!' : 'Keep pushing forward.'}
                    </div>
                    <h1 className="text-5xl font-serif text-slate-900 leading-tight">
                        Welcome back, <span className="text-terracotta">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-500 text-lg font-medium max-w-xl">
                        {readiness.overall_readiness > 0
                            ? `Your current readiness score is ${readiness.overall_readiness}%. You've improved by 15% since last week.`
                            : "Start your first AI evaluation to see your readiness score."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 relative z-10">
                    <button
                        onClick={() => navigate('/voice-eval')}
                        className="flex items-center gap-3 px-8 py-4 bg-terracotta text-white rounded-2xl font-bold shadow-xl shadow-terracotta/20 hover:bg-orange-800 hover:-translate-y-1 transition-all active:translate-y-0"
                    >
                        <FiMic size={20} /> Start Voice Practice
                    </button>
                    <button
                        onClick={() => navigate('/text-eval')}
                        className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                        <FiFileText size={20} /> New Text Session
                    </button>
                </div>

                {/* Decorative Pattern */}
                <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />
            </header>

            {/* --- Stat Grid --- */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { icon: FiAward, label: 'Readiness Score', value: `${readiness.overall_readiness}%`, trend: '+15%', color: 'text-emerald-600', link: '/prep' },
                    { icon: FiCode, label: 'Problem Proficiency', value: stats.problems_solved, trend: '+4 today', color: 'text-terracotta', link: '/dsa' },
                    { icon: FiSearch, label: 'Resume ATS Rank', value: `${stats.ats_score}%`, trend: 'Top 10%', color: 'text-blue-600', link: '/resume' },
                    { icon: FiZap, label: 'Active Streak', value: `${stats.current_streak} Days`, trend: 'New Daily High', color: 'text-amber-500', link: '/history' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => navigate(stat.link)}
                        className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-soft hover:shadow-high transition-all cursor-pointer group flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl bg-stone-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={28} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</h3>
                            <div className="text-4xl font-serif text-slate-900 group-hover:text-terracotta transition-colors">{stat.value}</div>
                        </div>
                    </motion.div>
                ))}
            </section>

            {/* --- Main Dashboard Content --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* Left: Progress Chart */}
                <motion.div
                    variants={cardVariants} custom={4} initial="hidden" animate="visible"
                    className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-soft"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-2xl font-serif text-slate-900">Consistency Heatmap</h3>
                            <p className="text-sm text-slate-500 font-medium">Your practice patterns over the last 10 weeks.</p>
                        </div>
                        <div className="flex bg-stone-50 p-1 rounded-xl">
                            <button className="px-4 py-2 bg-white shadow-soft rounded-lg text-xs font-bold text-slate-900">Weekly</button>
                            <button className="px-4 py-2 text-xs font-bold text-slate-400">Monthly</button>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData?.weekly || []}>
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#c2410c" stopOpacity={1} />
                                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={15} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="DSA" fill="url(#barGradient)" radius={[8, 8, 8, 8]} barSize={24} />
                                <Bar dataKey="Behavioral" fill="#cbd5e1" radius={[8, 8, 8, 8]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right: Recommendations & Activity */}
                <motion.div
                    variants={cardVariants} custom={5} initial="hidden" animate="visible"
                    className="space-y-10"
                >
                    {/* Career Insights */}
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-high text-white relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-xl font-serif flex items-center gap-2">
                                <FiZap className="text-terracotta" /> AI Growth Tips
                            </h3>
                            <ul className="space-y-4">
                                {readiness.recommendations.slice(0, 3).map((rec, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                        <div className="mt-1 text-terracotta"><FiCheckCircle size={16} /></div>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
                                View Full Report
                            </button>
                        </div>
                        <div className="absolute bottom-[-10%] right-[-10%] opacity-20 group-hover:scale-110 transition-transform">
                            <FiAward size={120} className="text-terracotta" />
                        </div>
                    </div>

                    {/* Recent sessions */}
                    <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-soft">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-serif text-slate-900">Recent Sessions</h3>
                            <button onClick={() => navigate('/history')} className="text-xs font-bold text-terracotta hover:underline tracking-widest uppercase">View All</button>
                        </div>
                        <div className="space-y-6">
                            {activity.slice(0, 4).map((act, i) => (
                                <div key={i} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate(`/evaluation/${act.id || ''}`)}>
                                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-slate-400 group-hover:bg-terracotta/10 group-hover:text-terracotta transition-all">
                                        {act.type === 'Voice' ? <FiMic size={20} /> : <FiCode size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-terracotta transition-colors">{act.title}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{act.type} · {new Date(act.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-sm font-black text-slate-800">{act.score}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* --- Skills & Platforms --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-soft">
                    <h3 className="text-2xl font-serif text-slate-900 mb-10">Skill Proficiency</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {(chartData?.skills || []).slice(0, 6).map((skill, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-slate-700">{skill.name}</span>
                                    <span className="text-xs font-black text-terracotta">{skill.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.progress}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-terracotta rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-stone-100 shadow-soft">
                    <h3 className="text-2xl font-serif text-slate-900 mb-10">Platform Engagement</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData?.radar || []}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, textAnchor: 'middle' }} />
                                <Radar name="Performance" dataKey="user" stroke="#c2410c" fill="#c2410c" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-12 animate-pulse bg-background">
            <div className="h-64 bg-stone-200 rounded-[2.5rem]" />
            <div className="grid grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-stone-200 rounded-[2.5rem]" />)}
            </div>
            <div className="grid grid-cols-3 gap-10">
                <div className="col-span-2 h-96 bg-stone-200 rounded-[2.5rem]" />
                <div className="h-96 bg-stone-200 rounded-[2.5rem]" />
            </div>
        </div>
    );
}
