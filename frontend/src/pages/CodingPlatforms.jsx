import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiExternalLink } from 'react-icons/fi';

const platforms = [
    { name: 'LeetCode', emoji: '🔶', color: '#f89f1b', url: 'https://leetcode.com', easy: 45, medium: 32, hard: 12, total: 89, rating: null, badge: 'Knight', streak: 15 },
    { name: 'Codeforces', emoji: '🔵', color: '#3b82f6', url: 'https://codeforces.com', easy: 20, medium: 18, hard: 8, total: 46, rating: 1342, badge: 'Specialist', streak: 0 },
    { name: 'CodeChef', emoji: '👨‍🍳', color: '#5c3317', url: 'https://codechef.com', easy: 30, medium: 15, hard: 5, total: 50, rating: 1485, badge: '3⭐', streak: 5 },
    { name: 'GeeksForGeeks', emoji: '🟢', color: '#2f8d46', url: 'https://geeksforgeeks.org', easy: 60, medium: 25, hard: 10, total: 95, rating: null, badge: 'Scholar', streak: 3 },
    { name: 'HackerRank', emoji: '🟩', color: '#00ea64', url: 'https://hackerrank.com', easy: 35, medium: 10, hard: 2, total: 47, rating: null, badge: 'Gold', streak: 0 },
    { name: 'AtCoder', emoji: '🔴', color: '#ef4444', url: 'https://atcoder.jp', easy: 10, medium: 8, hard: 3, total: 21, rating: 520, badge: 'Gray', streak: 2 },
];

const monthlyData = [
    { month: 'Sep', LeetCode: 12, Codeforces: 5, CodeChef: 8 },
    { month: 'Oct', LeetCode: 18, Codeforces: 8, CodeChef: 10 },
    { month: 'Nov', LeetCode: 22, Codeforces: 6, CodeChef: 12 },
    { month: 'Dec', LeetCode: 15, Codeforces: 10, CodeChef: 7 },
    { month: 'Jan', LeetCode: 28, Codeforces: 12, CodeChef: 8 },
    { month: 'Feb', LeetCode: 35, Codeforces: 15, CodeChef: 13 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
            {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: '0.8rem' }}>{p.name}: {p.value}</p>)}
        </div>
    );
};

export default function CodingPlatforms() {
    const [selected, setSelected] = useState(null);
    const totalSolved = platforms.reduce((sum, p) => sum + p.total, 0);

    return (
        <div className="animate-fade" style={{ maxWidth: 1300, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>📊 Coding Platforms</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Track your DSA progress across all coding platforms</p>

            {/* Summary Stat */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Solved</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{totalSolved}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Easy</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>{platforms.reduce((s, p) => s + p.easy, 0)}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Medium</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)' }}>{platforms.reduce((s, p) => s + p.medium, 0)}</div>
                </div>
                <div className="card" style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Hard</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--error)' }}>{platforms.reduce((s, p) => s + p.hard, 0)}</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Solved by Difficulty (per Platform)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={platforms} barSize={12} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            <Bar dataKey="easy" stackId="a" fill="#10b981" name="Easy" />
                            <Bar dataKey="medium" stackId="a" fill="#f59e0b" name="Medium" />
                            <Bar dataKey="hard" stackId="a" fill="#ef4444" name="Hard" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Monthly Solve Trend</h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            <Line type="monotone" dataKey="LeetCode" stroke="#f89f1b" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="Codeforces" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                            <Line type="monotone" dataKey="CodeChef" stroke="#5c3317" strokeWidth={2.5} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Platform Cards */}
            <div className="grid-3">
                {platforms.map(p => (
                    <div key={p.name} className="card" style={{ cursor: 'pointer', border: selected === p.name ? `2px solid ${p.color}` : '1px solid var(--border)' }}
                        onClick={() => setSelected(selected === p.name ? null : p.name)}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                        onMouseLeave={e => { if (selected !== p.name) e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.75rem' }}>{p.emoji}</span>
                                <div>
                                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.badge}</div>
                                </div>
                            </div>
                            <a href={p.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                                style={{ color: 'var(--text-muted)', padding: '0.3rem' }}
                                onMouseEnter={e => e.currentTarget.style.color = p.color}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                                <FiExternalLink size={16} />
                            </a>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: p.color }}>{p.total}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Problems Solved</div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            {[{ label: 'Easy', val: p.easy, color: 'var(--success)' }, { label: 'Med', val: p.medium, color: 'var(--warning)' }, { label: 'Hard', val: p.hard, color: 'var(--error)' }].map(d => (
                                <div key={d.label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: 6, padding: '0.4rem' }}>
                                    <div style={{ fontWeight: 700, color: d.color, fontSize: '0.9rem' }}>{d.val}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.label}</div>
                                </div>
                            ))}
                        </div>

                        {p.rating && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Rating: <span style={{ fontWeight: 700, color: p.color }}>{p.rating}</span></div>}
                        {p.streak > 0 && <div style={{ fontSize: '0.78rem', color: 'var(--warning)', textAlign: 'center', marginTop: '0.25rem' }}>🔥 {p.streak}-day streak</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
