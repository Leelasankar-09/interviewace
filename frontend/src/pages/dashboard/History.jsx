// src/pages/dashboard/History.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiClock, FiTrendingUp, FiSearch, FiFilter,
    FiArrowRight, FiActivity, FiDownload, FiTrash2,
    FiCode, FiMic, FiLayers, FiFileText, FiCpu
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ICON_MAP = {
    'dsa': <FiCode />,
    'behavioral': <FiMic />,
    'system-design': <FiLayers />,
    'resume': <FiFileText />,
    'mock': <FiCpu />
};

export default function History() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/profile/history');
            setSessions(res.data);
        } catch (err) {
            toast.error("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'All' ? sessions : sessions.filter(s => s.type === filter.toLowerCase());

    return (
        <div className="max-w-5xl mx-auto animate-fade pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold">Practice History</h2>
                    <p className="text-text-secondary text-sm">Review your past performance and track growth over time.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl">
                    {['All', 'DSA', 'Behavioral', 'Resume'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-indigo-500 text-white shadow-glow' : 'text-text-muted hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-3xl" />)
                ) : filtered.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[3rem] p-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-text-muted mb-6">
                            <FiClock size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No history yet</h3>
                        <p className="text-text-secondary text-sm">Start your first practice session to see it here.</p>
                    </div>
                ) : (
                    filtered.map((s, i) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => s.type !== 'dsa' && navigate(`/evaluation/${s.id}`)}
                            className="bg-white/5 border border-white/5 p-6 rounded-[2rem] hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all cursor-pointer flex items-center gap-6 group"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xl shrink-0 group-hover:scale-110 transition-transform">
                                {ICON_MAP[s.type] || <FiClock />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{s.type}</span>
                                    <span className="text-[10px] text-text-muted opacity-40">•</span>
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{new Date(s.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-white truncate text-lg group-hover:text-indigo-400 transition-colors">
                                    {s.question || s.title || (s.type === 'resume' ? 'Resume Analysis' : 'Practice Session')}
                                </h4>
                            </div>

                            <div className="flex items-center gap-8 shrink-0">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Score</p>
                                    <p className={`text-xl font-bold ${s.score_overall >= 80 ? 'text-emerald-400' : s.score_overall >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                        {s.score_overall || s.ats_score || '--'}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-muted group-hover:text-white transition-all">
                                    <FiArrowRight />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
