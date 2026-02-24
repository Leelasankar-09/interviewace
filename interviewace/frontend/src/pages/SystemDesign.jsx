import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { mockAPI, analyticsAPI } from '../api/services';

const TOPICS = [
    { id: 'url-shortener', title: 'URL Shortener', icon: '🔗', difficulty: 'Medium', companies: ['Google', 'Meta'] },
    { id: 'rate-limiter', title: 'Rate Limiter', icon: '🚦', difficulty: 'Medium', companies: ['Uber', 'Stripe'] },
    { id: 'instagram', title: 'Design Instagram', icon: '📸', difficulty: 'Hard', companies: ['Meta', 'Google'] },
    { id: 'uber', title: 'Design Uber', icon: '🚗', difficulty: 'Hard', companies: ['Uber', 'Lyft'] },
    { id: 'whatsapp', title: 'Design WhatsApp', icon: '💬', difficulty: 'Hard', companies: ['Meta', 'Microsoft'] },
    { id: 'youtube', title: 'Design YouTube', icon: '▶️', difficulty: 'Hard', companies: ['Google', 'Netflix'] },
    { id: 'notification', title: 'Notification System', icon: '🔔', difficulty: 'Medium', companies: ['Amazon', 'Airbnb'] },
    { id: 'search', title: 'Search Autocomplete', icon: '🔍', difficulty: 'Medium', companies: ['Google', 'LinkedIn'] },
];

const QUESTION_MAP = {
    'url-shortener': 'Design a URL shortener like bit.ly that can handle 100M URLs and 10B redirects per day.',
    'rate-limiter': 'Design a distributed rate limiter that can handle 10,000 requests per second.',
    'instagram': 'Design Instagram — photo sharing, feeds, stories, and recommendations at scale.',
    'uber': 'Design the Uber backend — ride matching, real-time location tracking, pricing at scale.',
    'whatsapp': 'Design WhatsApp — end-to-end encrypted messaging for 2 billion users.',
    'youtube': 'Design YouTube — video upload, processing, storage, and global streaming delivery.',
    'notification': 'Design a notification system that can send 1M notifications per minute across email, SMS, and push.',
    'search': 'Design a Google search autocomplete / typeahead system.',
};

const FRAMEWORKS = ['CAP Theorem', 'Load Balancing', 'Caching (Redis)', 'Databases (SQL vs NoSQL)', 'Microservices', 'Message Queues', 'CDN', 'Sharding'];

export default function SystemDesign() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [phase, setPhase] = useState('list'); // list | design | done
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        analyticsAPI.track('page_view', '/system-design');
    }, []);

    const startDesign = (topic) => {
        setSelected(topic);
        setNotes('');
        setPhase('design');
        analyticsAPI.track('feature_use', '/system-design', 'start_design', { topic: topic.id });
    };

    const submitDesign = async () => {
        if (!notes.trim()) { toast.warning('Write your design before submitting'); return; }
        setSaving(true);
        try {
            await mockAPI.save({
                question_text: QUESTION_MAP[selected.id] || selected.title,
                answer_text: notes,
                round_type: 'System Design',
                role_tag: 'Software Engineer',
            });
            toast.success('Design saved to your history!');
            setPhase('done');
        } catch { toast.error('Could not save design.'); }
        finally { setSaving(false); }
    };

    const ds = (d) => d === 'Hard' ? '#ef4444' : d === 'Medium' ? '#f59e0b' : '#22c55e';
    const filtered = filter === 'All' ? TOPICS : TOPICS.filter(t => t.difficulty === filter);

    if (phase === 'design') return (
        <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <button onClick={() => setPhase('list')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0.5rem', padding: 0 }}>← Back</button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{selected.icon} {selected.title}</h2>
                    <span style={{ fontSize: '0.85rem', color: ds(selected.difficulty), fontWeight: 700 }}>{selected.difficulty}</span>
                </div>
                <button onClick={submitDesign} disabled={saving}
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                    {saving ? 'Saving…' : '✅ Submit Design'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
                <div>
                    {/* Question */}
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>📋 Problem Statement</h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{QUESTION_MAP[selected.id]}</p>
                    </div>

                    {/* Design Area */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>✏️ Your Design</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={18}
                            placeholder={`Cover:
• Requirements (functional & non-functional)
• High-level architecture / components
• Database schema & choices
• APIs / endpoints
• Scaling & bottlenecks
• Trade-offs and assumptions`}
                            style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical', fontSize: '0.95rem', lineHeight: 1.6, fontFamily: 'inherit' }} />
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🏢 Common Companies</h4>
                        {selected.companies.map(c => (
                            <div key={c} style={{ padding: '0.4rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>{c}</div>
                        ))}
                    </div>
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🔧 Key Concepts</h4>
                        {FRAMEWORKS.map(f => (
                            <div key={f} style={{ padding: '0.4rem 0.75rem', borderLeft: '3px solid var(--accent)', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (phase === 'done') return (
        <div className="animate-fade" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <div className="card" style={{ padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏛️</div>
                <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Design Saved!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your system design for <strong>{selected.title}</strong> has been saved.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => setPhase('list')} style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem', border: '2px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}>
                        🔄 Try Another
                    </button>
                    <button onClick={() => navigate('/history')} style={{ padding: '0.85rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                        📚 View History
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>🏛️ System Design</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Design large-scale systems used at top tech companies</p>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {['All', 'Medium', 'Hard'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{
                            padding: '0.5rem 1.25rem', borderRadius: '2rem', border: '2px solid', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
                            background: filter === f ? 'var(--accent)' : 'transparent',
                            color: filter === f ? '#fff' : 'var(--text-primary)'
                        }}>
                        {f}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {filtered.map(t => (
                    <div key={t.id} className="card" onClick={() => startDesign(t)}
                        style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '2.5rem' }}>{t.icon}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: ds(t.difficulty), background: ds(t.difficulty) + '20', padding: '0.25rem 0.6rem', borderRadius: '1rem' }}>{t.difficulty}</span>
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{t.title}</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {t.companies.map(c => (
                                <span key={c} style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', color: 'var(--text-muted)' }}>{c}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
