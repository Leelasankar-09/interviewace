import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiZap, FiCode, FiSearch, FiFilter } from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import { analyticsAPI } from '../api/services';
import api from '../api/axios';

const MEDAL = ['🥇', '🥈', '🥉'];
const SORT_OPTIONS = [
    { value: 'rank_score', label: '🏆 Overall Rank' },
    { value: 'avg_score', label: '📊 Avg Score' },
    { value: 'streak_days', label: '🔥 Streak' },
    { value: 'total_sessions', label: '📚 Sessions' },
];

export default function Leaderboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [board, setBoard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('rank_score');
    const [colleges, setColleges] = useState([]);
    const [collegeFilter, setCollegeFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        analyticsAPI.track('page_view', '/leaderboard');
        api.get('/api/leaderboard/colleges').then(r => setColleges(r.data.colleges || [])).catch(() => { });
        if (user?.id) {
            api.get('/api/leaderboard/me').then(r => setMyRank(r.data)).catch(() => { });
        }
    }, [user?.id]);

    useEffect(() => {
        setLoading(true);
        const params = { sort_by: sortBy, limit: 50 };
        if (collegeFilter) params.college = collegeFilter;
        api.get('/api/leaderboard', { params })
            .then(r => setBoard(r.data.leaderboard || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [sortBy, collegeFilter]);

    const filtered = board.filter(u =>
        !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.college || '').toLowerCase().includes(search.toLowerCase())
    );

    const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';

    return (
        <div className="animate-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                    🏆 Leaderboard
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Ranked by interview performance, streaks, and consistency
                </p>
            </div>

            {/* My Rank Banner */}
            {myRank && (
                <div style={{
                    background: 'var(--gradient-card)', border: '1px solid var(--border-accent)',
                    borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.75rem', marginBottom: '1.75rem',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem', color: '#fff', fontWeight: 800,
                    }}>
                        {user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{user?.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {myRank.college || 'No college set'} {myRank.cgpa && `· CGPA ${myRank.cgpa}`}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                        {[
                            { label: 'Rank', value: myRank.rank ? `#${myRank.rank}` : 'Unranked', color: '#6366f1' },
                            { label: 'Avg Score', value: `${myRank.avg_score}%`, color: scoreColor(myRank.avg_score) },
                            { label: 'Streak', value: `${myRank.streak_days}🔥`, color: '#f59e0b' },
                            { label: 'Sessions', value: myRank.total_sessions, color: '#10b981' },
                        ].map(({ label, value, color }) => (
                            <div key={label}>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color }}>{value}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1', minWidth: 200 }}>
                    <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Search name or college…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.25rem' }} />
                </div>
                {/* College filter */}
                {colleges.length > 0 && (
                    <select className="input" value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)}
                        style={{ width: 'auto', minWidth: 180 }}>
                        <option value="">All Colleges</option>
                        {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
                {/* Sort */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {SORT_OPTIONS.map(({ value, label }) => (
                        <button key={value} onClick={() => setSortBy(value)}
                            style={{
                                padding: '0.5rem 0.9rem', borderRadius: '2rem', fontSize: '0.78rem',
                                fontWeight: 600, cursor: 'pointer', border: '2px solid', transition: 'all 0.2s',
                                borderColor: sortBy === value ? 'var(--accent)' : 'var(--border)',
                                background: sortBy === value ? 'var(--accent)' : 'transparent',
                                color: sortBy === value ? '#fff' : 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                            }}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top 3 Podium */}
            {!loading && filtered.length >= 3 && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center', alignItems: 'flex-end' }}>
                    {[filtered[1], filtered[0], filtered[2]].map((u, podiumIdx) => {
                        if (!u) return null;
                        const heights = [140, 170, 120];
                        const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
                        return (
                            <div key={u.id} style={{
                                flex: 1, maxWidth: 240, textAlign: 'center', padding: '1.5rem 1rem',
                                background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
                                borderRadius: 'var(--radius-lg)', height: heights[podiumIdx],
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transition: 'transform 0.2s', cursor: 'default',
                            }}>
                                <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{MEDAL[rank - 1]}</div>
                                <div style={{
                                    width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 800, fontSize: '1.1rem', margin: '0.35rem auto',
                                }}>
                                    {u.avatar_initials}
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{u.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{u.college}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: scoreColor(u.avg_score) }}>
                                    {u.avg_score}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Full Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem' }}>⏳</div><p>Loading rankings…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2.5rem' }}>🏁</div>
                    <p>No ranked users yet — start practicing to appear here!</p>
                    <button onClick={() => navigate('/behavioral')} style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        Start Practicing
                    </button>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px 80px 80px 80px',
                        padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-secondary)', fontSize: '0.72rem', fontWeight: 700,
                        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        <span>#</span><span>User</span><span>College</span>
                        <span style={{ textAlign: 'center' }}>CGPA</span>
                        <span style={{ textAlign: 'center' }}>Avg Score</span>
                        <span style={{ textAlign: 'center' }}>Streak</span>
                        <span style={{ textAlign: 'center' }}>Sessions</span>
                    </div>
                    {filtered.map((u, i) => (
                        <div key={u.id} style={{
                            display: 'grid', gridTemplateColumns: '60px 1fr 160px 80px 80px 80px 80px',
                            padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)',
                            alignItems: 'center', transition: 'background 0.15s',
                            background: user?.id === u.id ? 'rgba(99,102,241,0.06)' : 'transparent',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = user?.id === u.id ? 'rgba(99,102,241,0.06)' : 'transparent'}
                        >
                            {/* Rank */}
                            <span style={{ fontWeight: 900, fontSize: i < 3 ? '1.2rem' : '0.9rem', color: i < 3 ? '#f59e0b' : 'var(--text-muted)' }}>
                                {i < 3 ? MEDAL[i] : `#${u.rank}`}
                            </span>
                            {/* User */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                                }}>
                                    {u.avatar_initials}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{u.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.target_role}</div>
                                </div>
                            </div>
                            {/* College */}
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {u.college}
                            </span>
                            {/* CGPA */}
                            <span style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: parseFloat(u.cgpa) >= 8 ? '#10b981' : parseFloat(u.cgpa) >= 6.5 ? '#f59e0b' : 'var(--text-primary)' }}>
                                {u.cgpa}
                            </span>
                            {/* Avg Score */}
                            <span style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.9rem', color: scoreColor(u.avg_score) }}>
                                {u.avg_score}%
                            </span>
                            {/* Streak */}
                            <span style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: u.streak_days > 5 ? '#f59e0b' : 'var(--text-primary)' }}>
                                {u.streak_days > 0 ? `${u.streak_days}🔥` : '—'}
                            </span>
                            {/* Sessions */}
                            <span style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                                {u.total_sessions}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
