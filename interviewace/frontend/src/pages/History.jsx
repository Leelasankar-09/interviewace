import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import useAuthStore from '../store/authStore';
import { sessionsAPI, analyticsAPI } from '../api/services';

const TYPE_LABELS = {
    voice: '🎙 Voice', behavioral: '💬 Behavioral', dsa: '💻 DSA',
    system_design: '🏗 System Design', mock: '🤖 Mock', resume: '📄 Resume'
};
const TYPE_COLORS = {
    voice: '#6366f1', behavioral: '#ec4899', dsa: '#10b981',
    system_design: '#f59e0b', mock: '#3b82f6', resume: '#8b5cf6'
};

function ScorePill({ score }) {
    if (score == null) return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>N/A</span>;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '1rem', background: color + '20', color }}>
            {score}%
        </span>
    );
}

function GradeBadge({ grade }) {
    if (!grade) return null;
    const color = grade.startsWith('A') ? '#10b981' : grade.startsWith('B') ? '#f59e0b' : '#ef4444';
    return <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{grade}</span>;
}

export default function History() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    const loadData = async () => {
        setLoading(true);
        try {
            const params = { page, limit: LIMIT };
            if (filter !== 'all') params.session_type = filter;
            if (user?.id) params.user_id = user.id;

            const [histRes, analyticsRes] = await Promise.all([
                sessionsAPI.history(params),
                user?.id ? sessionsAPI.analytics(user.id, 90) : Promise.resolve(null),
            ]);
            setSessions(histRes.data.sessions || []);
            setTotal(histRes.data.total || 0);
            if (analyticsRes) setAnalytics(analyticsRes.data);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    useEffect(() => {
        analyticsAPI.track('page_view', '/history');
    }, []);

    useEffect(() => {
        loadData();
    }, [filter, page, user?.id]);

    const relTime = (iso) => {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    const PAGE_TABS = ['all', 'voice', 'behavioral', 'dsa', 'mock', 'system_design', 'resume'];

    return (
        <div className="animate-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>📚 Session History</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        All your interview sessions — {total} total
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => navigate('/behavioral')}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '0.75rem', border: '2px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
                        + New Session
                    </button>
                </div>
            </div>

            {/* Stats row */}
            {analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Sessions', value: analytics.total_sessions, color: '#6366f1' },
                        { label: 'Avg Score', value: `${analytics.avg_score}%`, color: analytics.avg_score >= 70 ? '#10b981' : '#f59e0b' },
                        { label: 'Best Score', value: `${analytics.best_score}%`, color: '#10b981' },
                        { label: 'Streak', value: `${analytics.streak_days}d 🔥`, color: '#f59e0b' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color, marginBottom: '0.25rem' }}>{value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Trend chart */}
            {analytics?.trend?.length > 1 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>📈 Score Trend</h3>
                    <ResponsiveContainer width="100%" height={130}>
                        <LineChart data={analytics.trend}>
                            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} tickFormatter={d => d.slice(5)} />
                            <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                            <Tooltip formatter={v => [`${v}%`, 'Avg Score']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                            <Line type="monotone" dataKey="avg_score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {PAGE_TABS.map(t => (
                    <button key={t} onClick={() => { setFilter(t); setPage(1); }}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', border: '2px solid',
                            borderColor: filter === t ? 'var(--accent)' : 'var(--border)',
                            background: filter === t ? 'var(--accent)' : 'transparent',
                            color: filter === t ? '#fff' : 'var(--text-primary)',
                        }}>
                        {t === 'all' ? '🗂 All' : (TYPE_LABELS[t] || t)}
                    </button>
                ))}
            </div>

            {/* Session list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
                    <p>Loading sessions…</p>
                </div>
            ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p>No sessions yet.</p>
                    <button onClick={() => navigate('/behavioral')}
                        style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        Start Practicing →
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sessions.map(s => (
                        <div key={s.id} className="card"
                            style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                                    {{ 'voice': '🎙', 'behavioral': '💬', 'dsa': '💻', 'mock': '🤖', 'system_design': '🏗', 'resume': '📄' }[s.session_type] || '📝'}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {s.question_text || `${s.session_type} session`}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span style={{ textTransform: 'capitalize', color: TYPE_COLORS[s.session_type] || 'var(--accent)', fontWeight: 600 }}>
                                            {TYPE_LABELS[s.session_type] || s.session_type}
                                        </span>
                                        <span>{relTime(s.created_at)}</span>
                                        {s.word_count > 0 && <span>{s.word_count} words</span>}
                                        {s.filler_count > 0 && <span style={{ color: '#f59e0b' }}>{s.filler_count} fillers</span>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                    <GradeBadge grade={s.grade} />
                                    <ScorePill score={s.overall_score} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {total > LIMIT && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1rem' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                                ← Prev
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Page {page} of {Math.ceil(total / LIMIT)}
                            </span>
                            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
                                style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', cursor: page >= Math.ceil(total / LIMIT) ? 'not-allowed' : 'pointer', opacity: page >= Math.ceil(total / LIMIT) ? 0.4 : 1 }}>
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
