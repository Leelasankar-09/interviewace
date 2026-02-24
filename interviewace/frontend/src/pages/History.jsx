import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { getSessions, getLocalAnalytics, deleteSession } from '../store/sessionStore';

const TYPE_LABELS = { voice: '🎙 Voice', behavioral: '💬 Behavioral', dsa: '💻 DSA', system_design: '🏗 System Design', mock: '🤖 Mock', resume: '📄 Resume' };
const TYPE_COLORS = { voice: '#6366f1', behavioral: '#ec4899', dsa: '#10b981', system_design: '#f59e0b', mock: '#3b82f6', resume: '#8b5cf6' };

function ScorePill({ score }) {
    if (score == null) return <span className="text-xs text-gray-600">N/A</span>;
    const color = score >= 80 ? 'text-emerald-400 bg-emerald-500/10' : score >= 60 ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10';
    return <span className={`text-xs font-black px-2 py-0.5 rounded-full ${color}`}>{score}%</span>;
}

function GradeBadge({ grade }) {
    if (!grade) return null;
    const color = grade.startsWith('A') ? 'text-emerald-400' : grade.startsWith('B') ? 'text-yellow-400' : 'text-red-400';
    return <span className={`text-sm font-black ${color}`}>{grade}</span>;
}

function StatCard({ label, value, sub, color = '#6366f1' }) {
    return (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
        </div>
    );
}

export default function History() {
    const [sessions, setSessions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [filter, setFilter] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    const load = () => {
        const type = filter === 'all' ? null : filter;
        setSessions(getSessions({ type, limit: 100 }));
        setAnalytics(getLocalAnalytics());
    };

    useEffect(() => { load(); }, [filter]);

    const handleDelete = (id) => {
        deleteSession(id);
        setDeleteId(null);
        load();
    };

    const fmt = s => {
        if (!s) return '—';
        const d = Math.floor(s / 60), r = s % 60;
        return d > 0 ? `${d}m ${r}s` : `${r}s`;
    };

    const relTime = iso => {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    return (
        <div className="animate-[fadeIn_0.4s_ease] max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">📚 Session History</h1>
                    <p className="text-sm text-gray-400 mt-0.5">All your interview attempts — locally stored &amp; synced</p>
                </div>
                <button onClick={() => navigate('/voice-eval')}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                    + New Session
                </button>
            </div>

            {/* Stats row */}
            {analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <StatCard label="Total Sessions" value={analytics.total_sessions} sub="all time" color="#6366f1" />
                    <StatCard label="Avg Score" value={`${analytics.avg_score}%`} sub="all sessions" color={analytics.avg_score >= 70 ? '#10b981' : '#f59e0b'} />
                    <StatCard label="Best Score" value={`${analytics.best_score}%`} sub="personal best" color="#10b981" />
                    <StatCard label="Streak" value={`${analytics.streak_days}d`} sub="consecutive days" color="#f59e0b" />
                </div>
            )}

            {/* Charts row */}
            {analytics && analytics.trend.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
                    {/* Trend */}
                    <div className="lg:col-span-2 bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">📈 Score Trend (30 days)</p>
                        <ResponsiveContainer width="100%" height={140}>
                            <LineChart data={analytics.trend}>
                                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} tickFormatter={d => d.slice(5)} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                                <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                                    formatter={v => [`${v}%`, 'Avg Score']} />
                                <Line type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* By type */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">📊 Sessions by Type</p>
                        <div className="flex flex-col gap-2">
                            {Object.entries(analytics.by_type).map(([type, count]) => (
                                <div key={type} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 w-24 truncate">{TYPE_LABELS[type] || type}</span>
                                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{
                                            width: `${Math.min(100, count / analytics.total_sessions * 100)}%`,
                                            background: TYPE_COLORS[type] || '#6366f1'
                                        }} />
                                    </div>
                                    <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dim Averages (voice sessions) */}
            {analytics?.dim_avgs && Object.keys(analytics.dim_avgs).length > 0 && (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🧠 Average Dimension Scores (Voice)</p>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {Object.entries(analytics.dim_avgs).map(([k, v]) => {
                            const color = v >= 75 ? '#10b981' : v >= 55 ? '#f59e0b' : '#ef4444';
                            return (
                                <div key={k} className="bg-white/[0.03] rounded-xl p-2 border border-white/5 text-center">
                                    <div className="text-lg font-black" style={{ color }}>{v}%</div>
                                    <div className="text-[9px] text-gray-500 mt-0.5 capitalize">{k.replace('_', ' ')}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'voice', 'behavioral', 'dsa', 'mock'].map(t => (
                    <button key={t} onClick={() => setFilter(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === t ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'text-gray-500 border border-white/10 hover:text-white'
                            }`}>
                        {t === 'all' ? '🗂 All' : TYPE_LABELS[t] || t}
                    </button>
                ))}
                <span className="ml-auto text-xs text-gray-600 self-center">{sessions.length} sessions</span>
            </div>

            {/* Session list */}
            {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-gray-500 text-sm">No sessions yet. <button onClick={() => navigate('/voice-eval')} className="text-indigo-400 hover:underline">Start practicing →</button></p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {sessions.map(s => (
                        <div key={s.id}
                            className="group bg-gray-900/60 border border-white/10 hover:border-white/20 rounded-2xl px-4 py-3 transition-all cursor-pointer"
                            onClick={() => navigate(`/history/${s.id}`)}>
                            <div className="flex items-center gap-4">
                                {/* Type icon */}
                                <span className="text-xl flex-shrink-0">{TYPE_LABELS[s.session_type]?.slice(0, 2)}</span>

                                {/* Main info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white font-medium truncate">
                                        {s.question_text || `${s.session_type} session`}
                                    </p>
                                    <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                                        <span>{relTime(s.created_at)}</span>
                                        {s.duration_secs > 0 && <span>{fmt(s.duration_secs)}</span>}
                                        {s.word_count > 0 && <span>{s.word_count} words</span>}
                                        {s.filler_count > 0 && <span className="text-yellow-500">{s.filler_count} fillers</span>}
                                        {s.vocal_filler_count > 0 && <span className="text-red-400">{s.vocal_filler_count}× uhm/um</span>}
                                    </div>
                                </div>

                                {/* Score + grade */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <GradeBadge grade={s.grade} />
                                    <ScorePill score={s.overall_score} />
                                    {/* Mini dim bars */}
                                    {s.dim_scores && Object.keys(s.dim_scores).length > 0 && (
                                        <div className="hidden md:flex items-end gap-0.5 h-5">
                                            {Object.values(s.dim_scores).slice(0, 8).map((v, i) => (
                                                <div key={i} className="w-1.5 rounded-sm"
                                                    style={{ height: `${Math.max(4, v / 100 * 20)}px`, background: v >= 75 ? '#10b981' : v >= 55 ? '#f59e0b' : '#ef4444' }} />
                                            ))}
                                        </div>
                                    )}
                                    {/* Delete */}
                                    <button onClick={e => { e.stopPropagation(); setDeleteId(s.id); }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 text-xs px-2 py-1">
                                        🗑
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete confirm */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-white font-bold mb-2">Delete session?</h3>
                        <p className="text-sm text-gray-400 mb-5">This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="flex-1 py-2 text-sm border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all">Cancel</button>
                            <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
