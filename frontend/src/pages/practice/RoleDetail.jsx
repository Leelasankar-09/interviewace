import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

const rolesData = {
    swe: {
        title: 'Software Engineer', emoji: '💻', color: '#6366f1',
        salary: '₹8L - ₹40L', timeline: '8-12 weeks', demand: 'Very High',
        mustHave: ['Data Structures & Algorithms', 'OOP Principles', 'System Design Basics', 'SQL & Databases', 'Git', 'Python/Java/C++'],
        goodToHave: ['Cloud (AWS/GCP)', 'Docker & K8s', 'CI/CD', 'Redis', 'GraphQL'],
        advanced: ['Distributed Systems', 'Microservices', 'Message Queues', 'Performance Tuning'],
        roadmap: [
            { week: 'Week 1-2', title: 'DSA Foundation', desc: 'Arrays, Strings, LinkedLists, Stacks, Queues. Solve 30 easy LeetCode.' },
            { week: 'Week 3-4', title: 'Trees & Graphs', desc: 'Binary trees, BFS/DFS, Tries. Solve 20 medium LeetCode problems.' },
            { week: 'Week 5-6', title: 'DP & Advanced DS', desc: 'Dynamic Programming, Heaps, Sliding Window. Target: 10 medium DP.' },
            { week: 'Week 7-8', title: 'System Design', desc: 'Load balancers, Databases, Caching, CAP theorem, Design Twitter/Uber.' },
            { week: 'Week 9-10', title: 'Behavioral + Mock', desc: 'STAR method, leadership stories, 3 full mock interviews.' },
            { week: 'Week 11-12', title: 'Apply & Revise', desc: 'Apply to companies, revise weak areas, resume polish.' },
        ],
        questions: {
            'Technical Round 1': ['Two Sum variations', 'Merge intervals', 'LRU Cache implementation', 'Binary search edge cases'],
            'System Design Round': ['Design URL Shortener', 'Design Instagram', 'Design Rate Limiter', 'Design Notification System'],
            'Behavioral Round': ['Tell me about a challenge you overcome', 'Describe a time you disagreed with a decision', 'Your greatest achievement'],
            'HR Round': ['Why this company?', '5-year plan?', 'Expected salary?', 'Notice period?'],
        },
        resources: [
            { name: 'NeetCode 150', type: 'Free', url: 'https://neetcode.io', desc: 'Best curated DSA list' },
            { name: 'Striver\'s DSA Sheet', type: 'Free', url: 'https://takeuforward.org', desc: 'Comprehensive Indian playlist' },
            { name: 'System Design Primer', type: 'Free', url: 'https://github.com/donnemartin/system-design-primer', desc: 'GitHub gold standard' },
            { name: 'Grokking System Design', type: 'Paid', url: 'https://educative.io', desc: 'Best paid course' },
        ],
    },
    frontend: {
        title: 'Frontend Developer', emoji: '🎨', color: '#ec4899',
        salary: '₹6L - ₹30L', timeline: '6-10 weeks', demand: 'High',
        mustHave: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js', 'REST APIs', 'Responsive Design', 'Git'],
        goodToHave: ['TypeScript', 'Next.js', 'Redux/Zustand', 'CSS Frameworks', 'Web Perf'],
        advanced: ['Micro-Frontends', 'WebAssembly', 'PWA', 'WebSockets'],
        roadmap: [
            { week: 'Week 1-2', title: 'JS Deep Dive', desc: 'Closures, Promises, Async/Await, Event Loop, Prototypes.' },
            { week: 'Week 3-4', title: 'React Mastery', desc: 'Hooks, Context, Custom hooks, React Query, Performance.' },
            { week: 'Week 5-6', title: 'Portfolio Projects', desc: 'Build 2-3 impressive React apps with good UX.' },
            { week: 'Week 7-8', title: 'TypeScript + Next.js', desc: 'Add TypeScript, SSR/SSG with Next.js.' },
            { week: 'Week 9-10', title: 'Interview Prep', desc: 'JS tricky questions, React internals, coding assignments.' },
        ],
        questions: {
            'Technical Round 1': ['Explain event loop', 'Closure examples', 'Promise vs async/await', 'Virtual DOM'],
            'Coding Assignment': ['Build a todo app', 'Implement infinite scroll', 'Create a custom hook'],
            'HR Round': ['Portfolio walkthrough', 'Dream company fit', 'Salary expectations'],
        },
        resources: [
            { name: 'javascript.info', type: 'Free', url: 'https://javascript.info', desc: 'Best JS tutorial' },
            { name: 'React Docs', type: 'Free', url: 'https://react.dev', desc: 'Official React documentation' },
            { name: 'Frontend Masters', type: 'Paid', url: 'https://frontendmasters.com', desc: 'Premium courses' },
        ],
    },
};

// Fallback for roles not fully defined
const fallback = (id) => ({ title: id, emoji: '🎯', color: '#6366f1', mustHave: [], goodToHave: [], advanced: [], roadmap: [], questions: {}, resources: [] });

export default function RoleDetail() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const role = rolesData[roleId] || fallback(roleId);
    const [tab, setTab] = useState('skills');
    const tabs = ['skills', 'roadmap', 'questions', 'resources'];

    return (
        <div className="animate-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/roles')} style={{ padding: '0.5rem', gap: '0.4rem' }}>
                    <FiArrowLeft /> Back
                </button>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${role.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
                    {role.emoji}
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{role.title}</h2>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>💰 {role.salary}</span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⏱️ {role.timeline} to ready</span>
                        <span style={{ fontSize: '0.78rem', padding: '0.1rem 0.5rem', borderRadius: 100, background: `${role.color}20`, color: role.color, fontWeight: 600 }}>{role.demand} Demand</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.1rem' }}>
                {tabs.map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 1.2rem',
                        fontFamily: 'var(--font-main)', fontWeight: tab === t ? 700 : 400,
                        color: tab === t ? role.color : 'var(--text-muted)',
                        borderBottom: `2px solid ${tab === t ? role.color : 'transparent'}`,
                        textTransform: 'capitalize', fontSize: '0.875rem', transition: 'all 0.2s',
                    }}>{t}</button>
                ))}
            </div>

            {/* Skills Tab */}
            {tab === 'skills' && (
                <div className="grid-3" style={{ alignItems: 'start' }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--error)' }}>🔴 Must-Have</h3>
                        {role.mustHave.map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                <FiCheckCircle style={{ color: 'var(--error)', flexShrink: 0 }} size={14} /> {s}
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--warning)' }}>🟡 Good-to-Have</h3>
                        {role.goodToHave.map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                <FiCheckCircle style={{ color: 'var(--warning)', flexShrink: 0 }} size={14} /> {s}
                            </div>
                        ))}
                    </div>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--success)' }}>🟢 Advanced (Senior)</h3>
                        {role.advanced.map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                <FiCheckCircle style={{ color: 'var(--success)', flexShrink: 0 }} size={14} /> {s}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Roadmap Tab */}
            {tab === 'roadmap' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {role.roadmap.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${role.color}20`, border: `2px solid ${role.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: role.color, fontSize: '0.85rem' }}>{i + 1}</div>
                                {i < role.roadmap.length - 1 && <div style={{ width: 2, height: 40, background: 'var(--border)', margin: '4px 0' }} />}
                            </div>
                            <div className="card" style={{ flex: 1, padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                    <h3 style={{ fontWeight: 700 }}>{step.title}</h3>
                                    <span className="badge badge-accent" style={{ fontSize: '0.72rem' }}>{step.week}</span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Questions Tab */}
            {tab === 'questions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {Object.entries(role.questions).map(([round, qs]) => (
                        <div key={round} className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: role.color }}>{round}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {qs.map((q, i) => (
                                    <div key={i} style={{ padding: '0.65rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Q{i + 1}: {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Resources Tab */}
            {tab === 'resources' && (
                <div className="grid-2">
                    {role.resources.map(r => (
                        <a key={r.name} href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                            <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = role.color; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{r.name}</h3>
                                    <span className={`badge ${r.type === 'Free' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>{r.type}</span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.desc}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
