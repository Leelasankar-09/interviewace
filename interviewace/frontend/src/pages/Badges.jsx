import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../api/services';
import api from '../api/axios';

const CATEGORY_COLORS = {
    streak: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
    sessions: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#6366f1' },
    score: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
    variety: { bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', text: '#ec4899' },
    dsa: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' },
    behavioral: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
    milestone: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
    profile: { bg: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)', text: '#14b8a6' },
};

const CATEGORY_LABELS = {
    streak: '🔥 Streak', sessions: '📚 Sessions', score: '📊 Score',
    variety: '🎯 Variety', dsa: '💻 DSA', behavioral: '💬 Behavioral',
    milestone: '🏁 Milestones', profile: '👤 Profile',
};

export default function Badges() {
    const navigate = useNavigate();
    const [badges, setBadges] = useState([]);
    const [earnedCount, setEarnedCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        analyticsAPI.track('page_view', '/badges');
        api.get('/api/badges/me')
            .then(r => {
                setBadges(r.data.badges || []);
                setEarnedCount(r.data.earned_count || 0);
                setTotal(r.data.total_count || 0);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const categories = ['all', ...new Set(badges.map(b => b.category))];
    const filtered = filter === 'all' ? badges : badges.filter(b => b.category === filter);
    const progress = total > 0 ? Math.round((earnedCount / total) * 100) : 0;

    return (
        <div className="animate-fade" style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>
                    🏅 Achievements
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Earn badges by practicing consistently, scoring high, and exploring all features.
                </p>
            </div>

            {/* Summary Card */}
            <div style={{
                background: 'var(--gradient-card)', border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-lg)', padding: '1.5rem 2rem', marginBottom: '1.75rem',
                display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap',
            }}>
                <div style={{ fontSize: '3.5rem' }}>🏆</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.35rem' }}>
                        {earnedCount} / {total} Badges Earned
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', maxWidth: 400 }}>
                        <div style={{
                            height: '100%', width: `${progress}%`,
                            background: 'var(--gradient)', borderRadius: 4,
                            transition: 'width 1s ease',
                        }} />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                        {progress}% complete — {total - earnedCount} more to unlock
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f59e0b' }}>{progress}%</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completion</div>
                </div>
            </div>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {categories.map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{
                        padding: '0.45rem 1rem', borderRadius: '2rem', fontSize: '0.8rem',
                        fontWeight: 600, cursor: 'pointer', border: '2px solid', transition: 'all 0.2s',
                        borderColor: filter === cat ? 'var(--accent)' : 'var(--border)',
                        background: filter === cat ? 'var(--accent)' : 'transparent',
                        color: filter === cat ? '#fff' : 'var(--text-secondary)',
                    }}>
                        {cat === 'all' ? '✨ All' : CATEGORY_LABELS[cat] || cat}
                    </button>
                ))}
            </div>

            {/* Badge Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem' }}>⏳</div><p>Loading achievements…</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {filtered.map(badge => {
                        const colors = CATEGORY_COLORS[badge.category] || CATEGORY_COLORS.milestone;
                        return (
                            <div key={badge.id} style={{
                                background: badge.earned ? colors.bg : 'var(--bg-card)',
                                border: `1px solid ${badge.earned ? colors.border : 'var(--border)'}`,
                                borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                                textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s',
                                opacity: badge.earned ? 1 : 0.45,
                                filter: badge.earned ? 'none' : 'grayscale(60%)',
                                cursor: 'default',
                                position: 'relative', overflow: 'hidden',
                            }}
                                onMouseEnter={e => badge.earned && (e.currentTarget.style.transform = 'translateY(-3px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                            >
                                {/* Earned sparkle */}
                                {badge.earned && (
                                    <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.7rem', color: colors.text, fontWeight: 800 }}>✓</div>
                                )}
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{badge.emoji}</div>
                                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem', color: badge.earned ? colors.text : 'var(--text-secondary)' }}>
                                    {badge.name}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                    {badge.desc}
                                </div>
                                {!badge.earned && (
                                    <div style={{ marginTop: '0.6rem', fontSize: '0.68rem', background: 'var(--border)', borderRadius: '0.5rem', padding: '0.2rem 0.5rem', display: 'inline-block', color: 'var(--text-muted)' }}>
                                        🔒 Locked
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CTA if no badges earned */}
            {!loading && earnedCount === 0 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        No badges yet — complete your first practice session to earn your first badge!
                    </p>
                    <button onClick={() => navigate('/behavioral')} style={{
                        padding: '0.7rem 2rem', borderRadius: '0.75rem', border: 'none',
                        background: 'var(--gradient)', color: '#fff', fontWeight: 700, cursor: 'pointer',
                    }}>
                        Start Practicing →
                    </button>
                </div>
            )}
        </div>
    );
}
