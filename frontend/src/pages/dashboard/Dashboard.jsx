import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import {
    FiCode, FiMic, FiLayers, FiFileText, FiAward,
    FiZap, FiActivity, FiTarget, FiMessageSquare, FiCalendar, FiArrowRight, FiShield
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
        <div className="max-w-[1200px] mx-auto space-y-10 selection:bg-indigo-500/30 pb-20">
            {/* Apple Hero Greeting */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
                <div>
                    <h1 className="title-page text-white mb-2">
                        Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]}.
                    </h1>
                    <p className="text-xl text-white/50 font-medium tracking-tight">
                        You have <span className="text-indigo-400">5 pending</span> interview simulations today.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="btn-secondary px-6 rounded-full h-11 text-sm font-bold bg-white/5 border border-white/5 text-white">Daily Logic</button>
                    <button onClick={() => navigate('/mock')} className="btn-primary px-8 rounded-full h-11 text-sm font-bold shadow-lg shadow-indigo-500/20">Live Training</button>
                </div>
            </motion.div>

            {/* Apple Activity Rings Style Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    icon={<FiActivity />}
                    label="Readiness"
                    value={`${readiness.score || 0}%`}
                    subValue="Overall Score"
                    gradient="from-indigo-500/80 to-purple-600/80"
                    percentage={readiness.score}
                />
                <ModernStatCard
                    icon={<FiTarget />}
                    label="Proficiency"
                    value={stats.avg_score || 0}
                    subValue="DSA Skill level"
                    gradient="from-blue-500/80 to-indigo-600/80"
                    percentage={(stats.avg_score / 10) * 100}
                />
                <ModernStatCard
                    icon={<FiShield />}
                    label="ATS Score"
                    value={`${stats.ats_score || 0}%`}
                    subValue="Resume Rank"
                    gradient="from-teal-400/80 to-emerald-600/80"
                    percentage={stats.ats_score}
                />
                <ModernStatCard
                    icon={<FiZap />}
                    label="Streak"
                    value={`${stats.streak || 0}`}
                    subValue="Days active"
                    gradient="from-pink-500/80 to-rose-600/80"
                    percentage={(stats.streak / 30) * 100}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Radar Analytics */}
                <div className="lg:col-span-2 glass border border-white/10 rounded-[2.5rem] p-10 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="title-card text-white mb-1">Intelligence Radar</h3>
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Candidate Comparison</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Current
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Benchmark
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={charts?.radar || []}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} />
                                <Radar
                                    name="Current"
                                    dataKey="user"
                                    stroke="#6366f1"
                                    fill="url(#radarGradient)"
                                    fillOpacity={0.6}
                                />
                                <Radar
                                    name="Benchmark"
                                    dataKey="target"
                                    stroke="rgba(255,255,255,0.1)"
                                    fill="transparent"
                                    strokeDasharray="4 4"
                                />
                                <defs>
                                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Breakdown & Activity */}
                <div className="space-y-8">
                    {/* Activity Grid */}
                    <div className="glass border border-white/10 rounded-[2.5rem] p-8">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/30 mb-8 flex items-center gap-2">
                            <FiCalendar /> Training Continuity
                        </h3>
                        <div className="grid grid-cols-7 gap-1.5">
                            {[...Array(28)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={`aspect-square rounded-[4px] ${Math.random() > 0.7
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/10'
                                            : 'bg-white/5'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="glass border border-white/10 rounded-[2.5rem] p-8 space-y-4">
                        <ShortcutItem icon={<FiCode />} title="DSA Lab" desc="Adaptive problems" onClick={() => navigate('/dsa')} />
                        <ShortcutItem icon={<FiMessageSquare />} title="Voice Lab" desc="STAR practice" onClick={() => navigate('/voice-eval')} />
                        <ShortcutItem icon={<FiLayers />} title="Design Lab" desc="Systems scale" onClick={() => navigate('/system-design')} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModernStatCard({ icon, label, value, subValue, gradient, percentage }) {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="glass border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group"
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/10`}>
                    {icon}
                </div>
                <div className="relative w-14 h-14">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="28" cy="28" r={radius} className="stroke-white/5 fill-none" strokeWidth="4" />
                        <motion.circle
                            cx="28" cy="28" r={radius}
                            className="stroke-indigo-500 fill-none"
                            strokeWidth="4"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/20">
                        {Math.round(percentage)}%
                    </div>
                </div>
            </div>
            <div>
                <h4 className="title-card text-white mb-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{value}</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{subValue}</p>
            </div>
        </motion.div>
    );
}

function ShortcutItem({ icon, title, desc, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="text-left">
                    <h5 className="text-sm font-bold text-white">{title}</h5>
                    <p className="text-[10px] font-medium text-white/30">{desc}</p>
                </div>
            </div>
            <FiArrowRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
    );
}

function DashboardSkeleton() {
    return (
        <div className="max-w-[1200px] mx-auto space-y-12 animate-pulse pb-20">
            <div className="flex justify-between items-end gap-6">
                <div className="space-y-4">
                    <div className="h-10 w-64 bg-white/5 rounded-xl" />
                    <div className="h-6 w-96 bg-white/5 rounded-xl" />
                </div>
                <div className="flex gap-4">
                    <div className="h-11 w-32 bg-white/5 rounded-full" />
                    <div className="h-11 w-40 bg-white/5 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-white/5 rounded-[2.5rem]" />)}
            </div>
            <div className="grid grid-cols-3 gap-8">
                <div className="h-[480px] bg-white/5 rounded-[2.5rem] col-span-2" />
                <div className="space-y-8">
                    <div className="h-[200px] bg-white/5 rounded-[2.5rem]" />
                    <div className="h-[240px] bg-white/5 rounded-[2.5rem]" />
                </div>
            </div>
        </div>
    );
}
