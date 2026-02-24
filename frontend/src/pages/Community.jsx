import { useState } from 'react';
import { FiThumbsUp, FiMessageCircle, FiTrendingUp, FiPlus, FiX } from 'react-icons/fi';

const posts = [
    { id: 1, author: 'Priya S.', college: 'IIT Bombay', company: 'Google', role: 'SDE-2', round: 'Technical Round 1', flair: 'Got Offer ✅', title: 'Google L4 — Dynamic Programming hard question asked!', body: 'They asked me to find the minimum number of coins to make change. After that asked a follow-up for unbounded knapsack. Then moved to system design...', tags: ['DP', 'Arrays', 'Google'], upvotes: 142, comments: 23, time: '2h ago' },
    { id: 2, author: 'Rahul M.', college: null, company: 'Amazon', role: 'SDE-1', round: 'System Design Round', flair: 'Rejected ❌', title: 'Amazon SDE-1 System Design — Tips from my experience', body: 'They asked to design a URL shortener. Focus on: scalability, consistent hashing, database choice. I forgot to mention rate limiting which cost me...', tags: ['System Design', 'Amazon', 'URL Shortener'], upvotes: 89, comments: 41, time: '5h ago' },
    { id: 3, author: 'Ananya K.', college: 'NIT Trichy', company: 'Microsoft', role: 'SDE-1', round: 'HR Round', flair: 'Got Offer ✅', title: 'Microsoft HR Round — What they really look for', body: 'They focus heavily on "growth mindset" and "learn it all not know it all". Be ready with stories about learning something new quickly. STAR method is a must!', tags: ['HR', 'Microsoft', 'Behavioral'], upvotes: 201, comments: 55, time: '1d ago' },
    { id: 4, author: 'Dev P.', college: null, company: 'Flipkart', role: 'SDE-2', round: 'Manager Round', flair: 'Ongoing 🔄', title: 'Flipkart Manager round — How to handle leadership questions?', body: 'The manager round was intense. They asked about conflict resolution, a time I had to handle a difficult team member, and my 5-year vision. Tips inside...', tags: ['Manager', 'Leadership', 'Flipkart'], upvotes: 67, comments: 18, time: '2d ago' },
];

const companies = ['All', 'Google', 'Amazon', 'Microsoft', 'Flipkart', 'Swiggy', 'Zomato'];
const rounds = ['All', 'Technical Round 1', 'Technical Round 2', 'System Design Round', 'HR Round', 'Manager Round', 'Bar Raiser'];

export default function Community() {
    const [filter, setFilter] = useState({ company: 'All', round: 'All' });
    const [votes, setVotes] = useState({});
    const [showPost, setShowPost] = useState(false);

    const filtered = posts.filter(p =>
        (filter.company === 'All' || p.company === filter.company) &&
        (filter.round === 'All' || p.round === filter.round)
    );

    return (
        <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>🌐 Community Forum</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Share and discover real interview experiences</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowPost(true)} style={{ gap: '0.5rem' }}>
                    <FiPlus /> Share Experience
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {companies.map(c => (
                        <button key={c} onClick={() => setFilter({ ...filter, company: c })}
                            className={`btn ${filter.company === c ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '0.35rem 0.8rem', fontSize: '0.78rem' }}>{c}</button>
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {rounds.map(r => (
                    <button key={r} onClick={() => setFilter({ ...filter, round: r })}
                        className={`btn ${filter.round === r ? 'btn-outline' : 'btn-ghost'}`}
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}>{r}</button>
                ))}
            </div>

            {/* Posts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filtered.map(post => {
                    const voted = votes[post.id];
                    return (
                        <div key={post.id} className="card" style={{ cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                            <div style={{ display: 'flex', gap: '1.25rem' }}>
                                {/* Vote */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                    <button onClick={() => setVotes({ ...votes, [post.id]: voted === 'up' ? null : 'up' })}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: voted === 'up' ? 'var(--accent)' : 'var(--text-muted)', transition: '0.2s' }}>
                                        <FiThumbsUp size={18} />
                                    </button>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        {post.upvotes + (voted === 'up' ? 1 : 0)}
                                    </span>
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem', alignItems: 'center' }}>
                                        <span className={`badge ${post.flair.includes('✅') ? 'badge-success' : post.flair.includes('❌') ? 'badge-error' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                                            {post.flair}
                                        </span>
                                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{post.company}</span>
                                        <span className="badge badge-accent" style={{ fontSize: '0.7rem' }}>{post.role}</span>
                                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{post.round}</span>
                                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{post.time}</span>
                                    </div>

                                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{post.title}</h3>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                                        {post.body.slice(0, 150)}...
                                    </p>

                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                        {post.tags.map(t => <span key={t} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 4, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>#{t}</span>)}
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                        <span>By <strong style={{ color: 'var(--text-primary)' }}>{post.author}</strong>{!post.college ? '' : ` · ${post.college}`}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiMessageCircle size={13} /> {post.comments} comments</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* New Post Modal */}
            {showPost && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontWeight: 700 }}>Share Interview Experience</h3>
                            <button onClick={() => setShowPost(false)} className="btn btn-ghost" style={{ padding: '0.4rem' }}><FiX /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="input" placeholder="Title (e.g. Google SDE-2 System Design experience)" />
                            <div className="grid-2">
                                <select className="select"><option>Company</option>{companies.slice(1).map(c => <option key={c}>{c}</option>)}</select>
                                <select className="select"><option>Round</option>{rounds.slice(1).map(r => <option key={r}>{r}</option>)}</select>
                            </div>
                            <select className="select">
                                <option>Outcome</option><option>Got Offer ✅</option><option>Rejected ❌</option><option>Ongoing 🔄</option>
                            </select>
                            <textarea className="input" rows={6} placeholder="Share your experience — questions asked, tips, what worked, what didn't..." style={{ resize: 'vertical' }} />
                            <input className="input" placeholder="Tags (comma separated): e.g. DP, Arrays, Google" />
                            <button className="btn btn-primary" style={{ justifyContent: 'center' }}>Post Experience 🚀</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
