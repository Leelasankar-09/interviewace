import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiDownload, FiShare2, FiCheckCircle,
    FiInfo, FiActivity, FiTarget, FiZap, FiBarChart2,
    FiClock, FiAlertCircle
} from 'react-icons/fi';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, Tooltip, RadarProps
} from 'recharts';
import { sessionAPI } from '../api/services';
import { toast } from 'react-toastify';

export default function EvaluationReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await sessionAPI.getOne(id);
                setSession(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load evaluation report.");
            } finally {
                setLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    if (loading) return <ReportSkeleton />;
    if (!session) return <div className="text-center py-20 font-serif text-slate-400">Report not found.</div>;

    const evalData = session.evaluation_json || {};
    const scores = evalData.scores || {};
    const feedback = evalData.feedback || { strengths: [], improvements: [], ai_summary: "" };
    const star = evalData.star_analysis || {};

    const radarData = Object.entries(scores).map(([name, score]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: score * 10
    }));

    const getScoreColor = (val) => {
        if (val >= 8) return 'text-emerald-600';
        if (val >= 6) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 bg-background min-h-screen">

            {/* --- Navigation & Actions --- */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-6"
            >
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to History
                </button>
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-soft">
                        <FiDownload /> Export PDF
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-high shadow-slate-900/10">
                        <FiShare2 /> Share Result
                    </button>
                </div>
            </motion.div>

            {/* --- Hero Overview --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 bg-white p-12 rounded-[3.5rem] border border-stone-100 shadow-soft flex flex-col md:flex-row gap-12 items-center relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <svg className="w-56 h-56 transform -rotate-90">
                            <circle cx="112" cy="112" r="100" fill="none" stroke="#f8fafc" strokeWidth="16" />
                            <motion.circle
                                initial={{ strokeDashoffset: 628 }}
                                animate={{ strokeDashoffset: 628 * (1 - session.overall_score / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="112" cy="112" r="100" fill="none" stroke="#c2410c" strokeWidth="16"
                                strokeDasharray="628"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-serif text-slate-900 font-black">{Math.round(session.overall_score)}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Overall Score</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-terracotta font-serif italic text-lg">
                                <FiActivity /> {session.question_type} Session
                            </div>
                            <h1 className="text-4xl font-serif text-slate-900">Performance Insight</h1>
                            <p className="text-slate-400 font-medium">Conducted on {new Date(session.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                <FiCheckCircle /> AI Grade: {session.grade || 'A'}
                            </span>
                            <span className="px-4 py-2 bg-stone-50 text-slate-500 rounded-2xl text-xs font-bold uppercase tracking-widest border border-stone-100">
                                {session.session_type} Mode
                            </span>
                        </div>

                        <p className="text-slate-600 leading-relaxed font-medium bg-stone-50 p-6 rounded-3xl border border-stone-100 italic">
                            "{feedback.ai_summary}"
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-900 p-12 rounded-[3.5rem] shadow-high text-white space-y-8 flex flex-col justify-center relative overflow-hidden"
                >
                    <h3 className="text-xl font-serif text-terracotta relative z-10">Session Analytics</h3>
                    <div className="space-y-6 relative z-10 font-sans">
                        {[
                            { icon: FiTarget, label: "STAR Coverage", value: `${session.star_fulfilled}/4` },
                            { icon: FiClock, label: "Duration", value: `${Math.floor(session.duration_secs / 60)}m ${session.duration_secs % 60}s` },
                            { icon: FiZap, label: "Word Count", value: session.word_count },
                            { icon: FiAlertCircle, label: "Filler Words", value: session.filler_count },
                        ].map((stat, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-xl"><stat.icon size={16} className="text-slate-400" /></div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</span>
                                </div>
                                <span className="text-xl font-bold font-serif">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                    {/* Decorative ring */}
                    <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 border-8 border-terracotta/10 rounded-full" />
                </motion.div>
            </div>

            {/* --- Skill Deep Dive --- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-12 rounded-[3.5rem] border border-stone-100 shadow-soft space-y-10"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-serif text-slate-900">Skill Profiling</h3>
                            <p className="text-sm text-slate-500 font-medium">Multidimensional balance of your response.</p>
                        </div>
                        <div className="p-4 bg-stone-50 text-terracotta rounded-full"><FiBarChart2 size={24} /></div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#f1f5f9" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#c2410c"
                                    fill="#c2410c"
                                    fillOpacity={0.15}
                                    strokeWidth={4}
                                />
                                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {Object.entries(scores).map(([key, val], i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-soft space-y-4 hover:border-terracotta/30 hover:-translate-y-1 transition-all group"
                        >
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-terracotta transition-colors">{key.replace('_', ' ')}</div>
                            <div className={`text-4xl font-serif ${getScoreColor(val)}`}>{val}</div>
                            <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${val * 10}%` }}
                                    transition={{ duration: 1 }}
                                    className={`h-full rounded-full ${val >= 8 ? 'bg-emerald-400' : val >= 6 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- STAR Method --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-16 rounded-[4rem] border border-stone-100 shadow-soft space-y-12"
            >
                <div className="text-center space-y-3">
                    <h3 className="text-4xl font-serif text-slate-900">STAR Analysis</h3>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">Evaluating the structural excellence of your behavioral narrative.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {['situation', 'task', 'action', 'result'].map((part, i) => (
                        <div key={part} className={`relative p-10 rounded-[3rem] border ${star[part] && !star[part].includes('N/A') ? 'bg-emerald-50/20 border-emerald-100' : 'bg-stone-50 border-stone-100'} group transition-all`}>
                            <div className="absolute -top-4 -left-4 w-10 h-10 bg-white border border-stone-100 rounded-xl shadow-soft flex items-center justify-center font-black text-slate-900">
                                {i + 1}
                            </div>
                            <div className="flex items-center justify-between mb-4 mt-2">
                                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">{part}</h4>
                                {star[part] && !star[part].includes('N/A') ? <FiCheckCircle className="text-emerald-500" size={20} /> : <FiAlertCircle className="text-slate-300" size={20} />}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                                {star[part] || "This structural anchor was missed in your delivery."}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* --- Feedback Cards --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-emerald-600 p-12 rounded-[4rem] shadow-high text-white relative overflow-hidden"
                >
                    <h3 className="text-2xl font-serif mb-10 flex items-center gap-3">
                        <FiCheckCircle className="text-emerald-300" /> Excellence Highlights
                    </h3>
                    <div className="space-y-4">
                        {feedback.strengths.map((s, i) => (
                            <div key={i} className="flex gap-5 items-start bg-white/10 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                                <span className="w-8 h-8 bg-white/20 text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                                <p className="text-emerald-50 text-sm font-medium leading-relaxed">{s}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-amber-500 p-12 rounded-[4rem] shadow-high text-white relative overflow-hidden"
                >
                    <h3 className="text-2xl font-serif mb-10 flex items-center gap-3">
                        <FiZap className="text-amber-200" /> Improvement Vector
                    </h3>
                    <div className="space-y-4">
                        {feedback.improvements.map((s, i) => (
                            <div key={i} className="flex gap-5 items-start bg-black/10 p-6 rounded-3xl border border-white/5 backdrop-blur-sm">
                                <span className="w-8 h-8 bg-black/20 text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                                <p className="text-amber-50 text-sm font-medium leading-relaxed">{s}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function ReportSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-pulse">
            <div className="h-64 bg-stone-200 rounded-[3.5rem]" />
            <div className="grid grid-cols-2 gap-8">
                <div className="h-96 bg-stone-200 rounded-[3.5rem]" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-stone-200 rounded-3xl" />)}
                </div>
            </div>
            <div className="h-80 bg-stone-200 rounded-[4rem]" />
        </div>
    );
}
