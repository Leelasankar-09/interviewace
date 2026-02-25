// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import {
    FiCode, FiMic, FiLayers, FiFileText, FiTrendingUp, FiAward,
    FiZap, FiActivity, FiTarget, FiPlus, FiChevronRight, FiCheckCircle,
    FiLayout, FiMessageSquare, FiCalendar
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';

export default function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [charts, setCharts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [dashRes, chartRes] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/dashboard/charts')
                ]);
                setData(dashRes.data);
                setCharts(chartRes.data);
            } catch (error) {
                console.error("Dashboard Load Error", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return <DashboardSkeleton />;

    const stats = data?.stats || {};
    const readiness = data?.readiness_score || {};

    return (
        <div className="max-w-[1400px] mx-auto animate-fade">
            {/* Header / Hero */}
            <div className="relative mb-12 p-8 md:p-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-600/10 to-pink-500/5 border border-white/5">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                            <FiActivity /> Interview Ready Level: {readiness.score > 80 ? 'Expert' : 'Intermediate'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Welcome Back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-text-secondary max-w-lg">
                            You're currently in the <span className="text-indigo-400 font-semibold">Top 15%</span> of candidates for {user?.target_role || 'Software Engineering'}. Let's close those skill gaps today.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/mock')}
                            className="btn btn-primary px-8 py-4 rounded-2xl shadow-glow"
                        >
                            <FiMic className="text-lg" /> Enter Mock Room
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Grid: Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<FiAward />}
                    label="Readiness Score"
                    value={`${readiness.score || 0}%`}
                    trend="+4.2%"
                    color="indigo"
                />
                <StatCard
                    icon={<FiCode />}
                    label="DSA Proficiency"
                    value={stats.avg_score || 0}
                    trend="Stable"
                    color="pink"
                />
                <StatCard
                    icon={<FiFileText />}
                    label="ATS Score"
                    value={`${stats.ats_score || 0}%`}
                    trend="+12%"
                    color="emerald"
                />
                <StatCard
                    icon={<FiZap />}
                    label="Daily Streak"
                    value={`${stats.streak || 0} Days`}
                    trend="Keep it up!"
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Readiness Breakdown */}
                <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex flex-col">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                        <FiTarget className="text-indigo-400" /> Readiness Breakdown
                    </h3>

                    <div className="flex-1 space-y-6">
                        {readiness.breakdown && Object.entries(readiness.breakdown).map(([key, val]) => (
                            <div key={key} className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-text-secondary capitalize">{key}</span>
                                    <span className="font-bold">{val} / 20</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(val / 20) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-8 w-full py-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:bg-indigo-500/20 transition-all">
                        Generate Study Plan
                    </button>
                </div>

                {/* Progress Chart */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold">Skill Radar</h3>
                            <p className="text-sm text-text-secondary">AI benchmarks vs your current performance</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts?.radar || []}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                <Radar
                                    name="Current"
                                    dataKey="user"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.4}
                                />
                                <Radar
                                    name="Target"
                                    dataKey="target"
                                    stroke="#ec4899"
                                    fill="transparent"
                                    strokeDasharray="4 4"
                                />
                                <Tooltip contentStyle={{ background: '#16161f', border: 'none', borderRadius: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Streak & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Streak Grid Placeholder */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FiCalendar className="text-amber-400" /> Activity Heatmap
                    </h3>
                    <div className="h-48 flex items-center justify-center text-text-muted">
                        {/* Custom Github-style contribution grid would go here */}
                        <div className="grid grid-cols-20 gap-1">
                            {[...Array(140)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-sm ${Math.random() > 0.7 ? 'bg-indigo-500/40' : 'bg-white/5'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-2 gap-4">
                    <ShortcutCard
                        icon={<FiCode />}
                        title="DSA Prep"
                        desc="120+ Problems"
                        onClick={() => navigate('/dsa')}
                    />
                    <ShortcutCard
                        icon={<FiMessageSquare />}
                        title="Behavioral"
                        desc="STAR Methodology"
                        onClick={() => navigate('/behavioral')}
                    />
                    <ShortcutCard
                        icon={<FiLayers />}
                        title="System Design"
                        desc="Scale & Tradeoffs"
                        onClick={() => navigate('/system-design')}
                    />
                    <ShortcutCard
                        icon={<FiFileText />}
                        title="Resume ATS"
                        desc="Keywords Scan"
                        onClick={() => navigate('/resume')}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend, color }) {
    const colors = {
        indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
        pink: 'from-pink-500/20 to-pink-500/5 text-pink-400 border-pink-500/20',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`bg-gradient-to-br ${colors[color]} border backdrop-blur-xl p-6 rounded-3xl`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-2xl">
                    {icon}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-white/5">
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
                <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
            </div>
        </motion.div>
    );
}

function ShortcutCard({ icon, title, desc, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:bg-white/10 hover:border-white/10 transition-all group"
        >
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 text-2xl mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h5 className="font-bold mb-1">{title}</h5>
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">{desc}</p>
        </button>
    );
}

function DashboardSkeleton() {
    return (
        <div className="max-w-[1400px] mx-auto animate-pulse space-y-12">
            <div className="h-64 bg-white/5 rounded-[2.5rem]" />
            <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white/5 rounded-3xl" />)}
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="h-96 bg-white/5 rounded-[2rem] col-span-1" />
                <div className="h-96 bg-white/5 rounded-[2rem] col-span-2" />
            </div>
        </div>
    );
}
