import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line, Legend
} from 'recharts';
import { FiCode, FiMic, FiLayers, FiFileText, FiTrendingUp, FiAward, FiZap, FiActivity } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

// Mock data (replace with API calls)
const mockUser = {
    name: 'Leela Sankar',
    streak: 12,
    totalSessions: 47,
    atsScore: 78,
    overallScore: 72,
};

const weeklyData = [
    { day: 'Mon', DSA: 3, Behavioral: 1, SystemDesign: 0, Mock: 0 },
    { day: 'Tue', DSA: 5, Behavioral: 2, SystemDesign: 1, Mock: 0 },
    { day: 'Wed', DSA: 2, Behavioral: 0, SystemDesign: 2, Mock: 1 },
    { day: 'Thu', DSA: 6, Behavioral: 3, SystemDesign: 1, Mock: 0 },
    { day: 'Fri', DSA: 4, Behavioral: 1, SystemDesign: 0, Mock: 1 },
    { day: 'Sat', DSA: 7, Behavioral: 2, SystemDesign: 3, Mock: 1 },
    { day: 'Sun', DSA: 3, Behavioral: 1, SystemDesign: 1, Mock: 0 },
];

const radarData = [
    { skill: 'DSA', you: 68, target: 90 },
    { skill: 'System Design', you: 55, target: 85 },
    { skill: 'Behavioral', you: 80, target: 90 },
    { skill: 'HR', you: 75, target: 80 },
    { skill: 'Vocabulary', you: 70, target: 85 },
    { skill: 'Communication', you: 65, target: 88 },
];

const progressData = [
    { month: 'Sep', score: 45 }, { month: 'Oct', score: 52 }, { month: 'Nov', score: 61 },
    { month: 'Dec', score: 58 }, { month: 'Jan', score: 68 }, { month: 'Feb', score: 72 },
];

const skillBars = [
    { name: 'DSA & Algorithms', value: 68, color: '#6366f1' },
    { name: 'System Design', value: 55, color: '#ec4899' },
    { name: 'Behavioral (STAR)', value: 80, color: '#10b981' },
    { name: 'HR Questions', value: 75, color: '#f59e0b' },
    { name: 'Communication', value: 65, color: '#3b82f6' },
    { name: 'Problem Solving', value: 70, color: '#a855f7' },
];

// Generate 70-day streak calendar
const generateStreak = () => {
    const days = [];
    const now = new Date();
    for (let i = 69; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const rand = Math.random();
        days.push({
            date: d,
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: rand > 0.35 ? Math.floor(rand * 8) + 1 : 0,
            activity: rand > 0.35 ? ['Solved 3 LeetCode Medium', 'Practiced Behavioral', 'System Design mock', 'Reviewed DSA'][(Math.floor(rand * 4))] : null,
        });
    }
    return days;
};

const streakDays = generateStreak();

const recentActivity = [
    { icon: '💻', text: 'Solved "Two Sum" (LeetCode Easy)', time: '2h ago', type: 'dsa' },
    { icon: '🎤', text: 'Behavioral Q: "Tell me about yourself" — Score: 8/10', time: '5h ago', type: 'behavioral' },
    { icon: '📄', text: 'Resume ATS scan — Score: 78/100', time: '1d ago', type: 'resume' },
    { icon: '🎭', text: 'Mock Interview: System Design round completed', time: '2d ago', type: 'mock' },
    { icon: '🏆', text: 'Completed 7-day streak! Earned badge', time: '3d ago', type: 'achievement' },
];

const statCards = [
    { icon: FiTrendingUp, label: 'Overall Score', value: '72/100', sub: '+4 this week', color: '#6366f1', trend: true },
    { icon: FiCode, label: 'Problems Solved', value: '134', sub: 'LeetCode + Others', color: '#10b981', trend: true },
    { icon: FiFileText, label: 'ATS Score', value: '78/100', sub: 'Last resume scan', color: '#f59e0b', trend: false },
    { icon: FiZap, label: 'Current Streak', value: '12 days 🔥', sub: 'Personal best: 18', color: '#ef4444', trend: true },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem' }}>
            <p style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{label}</p>
            {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: '0.8rem' }}>{p.name}: {p.value}</p>)}
        </div>
    );
};

export default function Dashboard() {
    const { user } = useAuthStore();
    const [hoveredDay, setHoveredDay] = useState(null);
    const displayUser = user?.name ? user : mockUser;

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }} className="animate-fade">
            {/* Welcome Banner */}
            <div style={{
                background: 'var(--gradient-card)', border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-lg)', padding: '1.75rem 2rem', marginBottom: '2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                        Welcome back, {displayUser.name?.split(' ')[0] || 'User'}! 👋
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        You're on a <span style={{ color: 'var(--warning)', fontWeight: 700 }}>{mockUser.streak}-day streak</span> — keep it up! Your overall score improved by <span style={{ color: 'var(--success)', fontWeight: 700 }}>+4 points</span> this week.
                    </p>
                </div>
                <div style={{ textAlign: 'center', display: 'none' }}>
                    <div style={{ fontSize: '3rem' }}>🔥</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mockUser.streak} days</div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
                {statCards.map(({ icon: Icon, label, value, sub, color, trend }) => (
                    <div key={label} className="card" style={{ cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={22} style={{ color }} />
                            </div>
                            {trend && <span style={{ fontSize: '0.72rem', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.5rem', borderRadius: 100 }}>↑ Up</span>}
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{value}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{label}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* Weekly Activity */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiActivity style={{ color: 'var(--accent)' }} /> Weekly Activity
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weeklyData} barSize={8}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                            <Bar dataKey="DSA" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Behavioral" stackId="a" fill="#ec4899" />
                            <Bar dataKey="SystemDesign" stackId="a" fill="#10b981" />
                            <Bar dataKey="Mock" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Skill Radar */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiAward style={{ color: 'var(--accent-2)' }} /> Skill Radar
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                            <Radar name="You" dataKey="you" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                            <Radar name="Target" dataKey="target" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Skills + Progress Chart */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {/* Skill Breakdown */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📊 Skill Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {skillBars.map(({ name, value, color }) => (
                            <div key={name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{name}</span>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Over Time */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>📈 Score Progress</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={progressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[30, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Practice Streak Calendar */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiFire style={{ color: 'var(--warning)' }} /> Practice Streak — Last 70 Days
                    {hoveredDay && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.3rem 0.75rem', borderRadius: 6, color: 'var(--text-secondary)' }}>
                            {hoveredDay.label}: {hoveredDay.activity || 'No activity'}
                        </span>
                    )}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {streakDays.map((day, i) => (
                        <div key={i} title={`${day.label}: ${day.activity || 'No activity'}`}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            style={{
                                width: 14, height: 14, borderRadius: 3, cursor: 'pointer',
                                transition: 'all 0.15s',
                                background: day.count === 0 ? 'var(--bg-hover)'
                                    : day.count < 3 ? 'rgba(99,102,241,0.3)'
                                        : day.count < 5 ? 'rgba(99,102,241,0.6)'
                                            : 'var(--accent)',
                                transform: hoveredDay?.date?.toDateString() === day.date?.toDateString() ? 'scale(1.4)' : 'scale(1)',
                            }} />
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Less
                    {[0, 0.3, 0.6, 1].map((op, i) => (
                        <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: op === 0 ? 'var(--bg-hover)' : `rgba(99,102,241,${op})` }} />
                    ))}
                    More
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>⚡ Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {recentActivity.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem',
                            background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                        }}>
                            <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                            <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.text}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
