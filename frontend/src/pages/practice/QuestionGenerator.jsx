import { useState } from 'react';

const ROLES = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'DevOps Engineer', 'Machine Learning Engineer', 'Product Manager', 'System Design'];
const TYPES = ['DSA / Coding', 'System Design', 'Behavioral / HR', 'Technical Conceptual', 'Mixed'];
const LEVELS = ['Fresher / Entry', 'Mid-Level (2-4 yrs)', 'Senior (5+ yrs)'];
const COMPANIES = ['Any', 'Google', 'Amazon (FAANG)', 'Microsoft', 'Meta', 'Flipkart', 'Swiggy/Zomato', 'Startup'];

// ─── Mock local generator (replaces live API for demo) ───────
function generateLocalQuestions(role, type, level, company, count) {
    const questionBank = {
        'DSA / Coding': [
            { q: 'Given an unsorted array, find the two numbers that sum to a target. Return their indices.', hint: 'Think HashMap', tag: 'Arrays', diff: 'Easy' },
            { q: 'Find the longest substring without repeating characters.', hint: 'Sliding Window', tag: 'Strings', diff: 'Medium' },
            { q: 'Given a BST, return the kth smallest element.', hint: 'In-order traversal', tag: 'Trees', diff: 'Medium' },
            { q: 'Implement LRU Cache with O(1) get and put.', hint: 'HashMap + Doubly Linked List', tag: 'Design', diff: 'Hard' },
            { q: 'Find the minimum number of coins to make a given amount (unbounded knapsack).', hint: 'Bottom-up DP', tag: 'DP', diff: 'Medium' },
            { q: 'Clone a graph with N nodes.', hint: 'BFS + HashMap', tag: 'Graphs', diff: 'Medium' },
            { q: 'Find all permutations of a string.', hint: 'Backtracking', tag: 'Recursion', diff: 'Medium' },
            { q: 'Given K sorted lists, merge them into one sorted list.', hint: 'Min-Heap', tag: 'Heaps', diff: 'Hard' },
        ],
        'System Design': [
            { q: `Design a URL shortener like bit.ly for ${company === 'Any' ? 'scale' : company}.`, hint: 'Hashing, Consistent Hashing, Caching', tag: 'Web Scale', diff: 'Medium' },
            { q: 'Design a real-time notification system for 100M users.', hint: 'WebSockets, Message Queues, Push/Pull', tag: 'Real-time', diff: 'Hard' },
            { q: 'Design a distributed cache system.', hint: 'Consistent hashing, eviction policies, replication', tag: 'Caching', diff: 'Hard' },
            { q: 'How would you design an API rate limiter?', hint: 'Token Bucket, Sliding Window, Redis', tag: 'Rate Limiting', diff: 'Medium' },
            { q: 'Design a news feed system like Instagram/Facebook.', hint: 'Fanout, ranking, pagination', tag: 'Feed', diff: 'Hard' },
            { q: 'Design a search autocomplete system.', hint: 'Trie, top-k, caching', tag: 'Search', diff: 'Medium' },
        ],
        'Behavioral / HR': [
            { q: 'Tell me about a time you had to complete a project with an extremely tight deadline. What did you do?', hint: 'Use STAR: describe urgency, your actions, tradeoffs & outcome', tag: 'Deadline Management', diff: 'Medium' },
            { q: 'Describe a situation where you disagreed with a technical decision made by your team lead.', hint: 'Show data-driven reasoning + team collaboration', tag: 'Conflict Resolution', diff: 'Medium' },
            { q: 'Tell me about a project you are most proud of. What was your specific contribution?', hint: 'Quantify impact — use numbers', tag: 'Achievement', diff: 'Easy' },
            { q: 'How have you handled a situation where requirements kept changing mid-project?', hint: 'Agile mindset, communication, prioritization', tag: 'Adaptability', diff: 'Medium' },
            { q: 'Give an example of when you had to learn a new technology under time pressure.', hint: 'Learning approach, resources used, outcome', tag: 'Growth Mindset', diff: 'Easy' },
        ],
        'Technical Conceptual': [
            { q: 'Explain the difference between process and thread. When would you use one over the other?', hint: 'Address memory space, context switching cost', tag: 'OS Concepts', diff: 'Medium' },
            { q: 'What is the CAP theorem? Give an example of a system that prioritizes CP vs AP.', hint: 'MongoDB vs Cassandra', tag: 'Distributed Systems', diff: 'Hard' },
            { q: 'How does HTTPS work? Walk me through an SSL/TLS handshake.', hint: 'Asymmetric → symmetric key exchange', tag: 'Networking', diff: 'Medium' },
            { q: 'What is a deadlock? How do you prevent it in concurrent systems?', hint: 'Coffman conditions, lock ordering', tag: 'Concurrency', diff: 'Hard' },
            { q: 'Explain indexing in SQL databases. When can an index hurt performance?', hint: 'B-tree, covering index, write overhead', tag: 'Databases', diff: 'Medium' },
        ],
    };

    const bankKey = type === 'Mixed' ? Object.keys(questionBank) : [type];
    let pool = bankKey.flatMap(k => questionBank[k] || []);

    // filter by level
    if (level === 'Fresher / Entry') pool = pool.filter(q => q.diff !== 'Hard');
    if (level === 'Senior (5+ yrs)') pool = pool.filter(q => q.diff !== 'Easy');

    // shuffle and slice
    return pool.sort(() => Math.random() - 0.5).slice(0, count);
}

const diffColor = { Easy: 'text-emerald-400 bg-emerald-500/10', Medium: 'text-yellow-400 bg-yellow-500/10', Hard: 'text-red-400 bg-red-500/10' };

export default function QuestionGenerator() {
    const [form, setForm] = useState({
        role: 'Software Engineer', type: 'DSA / Coding', level: 'Mid-Level (2-4 yrs)',
        company: 'Any', count: 5, topics: '', useAI: false,
    });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [starred, setStarred] = useState({});
    const [practiced, setPracticed] = useState({});
    const [history, setHistory] = useState([]);

    const generate = async () => {
        setLoading(true);
        setQuestions([]);
        if (form.useAI) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/questions/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form),
                });
                if (res.ok) {
                    const data = await res.json();
                    setQuestions(data.questions);
                    setLoading(false);
                    return;
                }
            } catch { /* Fall through to local */ }
        }
        // Local generation (no backend needed)
        await new Promise(r => setTimeout(r, 1000));
        const qs = generateLocalQuestions(form.role, form.type, form.level, form.company, form.count);
        setQuestions(qs);
        setHistory(h => [{ time: new Date().toLocaleTimeString(), role: form.role, type: form.type, count: qs.length }, ...h.slice(0, 4)]);
        setLoading(false);
    };

    const toggleStar = i => setStarred(s => ({ ...s, [i]: !s[i] }));
    const toggleDone = i => setPracticed(p => ({ ...p, [i]: !p[i] }));

    const starredList = questions.filter((_, i) => starred[i]);

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-1">🤖 AI Question Generator</h2>
                <p className="text-sm text-gray-400">Generate role-specific interview questions — powered by local NLP or Claude AI</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Config Panel ──────────────────────────────────── */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">⚙️ Configuration</h3>

                        {[
                            { label: 'Role / Track', key: 'role', opts: ROLES },
                            { label: 'Question Type', key: 'type', opts: TYPES },
                            { label: 'Experience Level', key: 'level', opts: LEVELS },
                            { label: 'Target Company', key: 'company', opts: COMPANIES },
                        ].map(({ label, key, opts }) => (
                            <div key={key} className="mb-4">
                                <label className="block text-xs text-gray-500 font-semibold mb-1">{label}</label>
                                <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer">
                                    {opts.map(o => <option key={o} value={o} className="bg-gray-900">{o}</option>)}
                                </select>
                            </div>
                        ))}

                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 font-semibold mb-1">Number of Questions</label>
                            <div className="flex gap-2">
                                {[3, 5, 8, 10].map(n => (
                                    <button key={n} onClick={() => setForm({ ...form, count: n })}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${form.count === n ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}>{n}</button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 font-semibold mb-1">Specific Topics (optional)</label>
                            <input value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })}
                                placeholder="e.g. Trees, DP, STAR method..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50" />
                        </div>

                        {/* AI toggle */}
                        <div className="flex items-center justify-between mb-5 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                            <div>
                                <p className="text-sm font-semibold text-white">Use Claude AI</p>
                                <p className="text-xs text-gray-500">Needs backend + API key</p>
                            </div>
                            <button onClick={() => setForm({ ...form, useAI: !form.useAI })}
                                className={`w-11 h-6 rounded-full transition-all relative ${form.useAI ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.useAI ? 'translate-x-5' : ''}`} />
                            </button>
                        </div>

                        <button onClick={generate} disabled={loading}
                            className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            {loading ? '⏳ Generating...' : '✨ Generate Questions'}
                        </button>
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🕒 Recent Generations</h3>
                            {history.map((h, i) => (
                                <div key={i} className="text-xs text-gray-500 border-b border-white/5 py-2 last:border-0">
                                    <p className="text-gray-300 font-semibold">{h.role} · {h.type}</p>
                                    <p>{h.count} questions at {h.time}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Starred questions */}
                    {starredList.length > 0 && (
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
                            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">⭐ Starred ({starredList.length})</h3>
                            {starredList.map((q, i) => (
                                <p key={i} className="text-xs text-gray-400 mb-2 line-clamp-2 border-b border-white/5 pb-2">{q.q}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Questions Panel ────────────────────────────────── */}
                <div className="lg:col-span-2">
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-900/30 border border-white/5 rounded-2xl">
                            <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                            <p className="text-gray-400 text-sm">Generating {form.count} questions for <strong className="text-indigo-400">{form.role}</strong>...</p>
                        </div>
                    )}

                    {!loading && questions.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 bg-gray-900/20 border border-white/5 rounded-2xl">
                            <div className="text-4xl mb-3">🤖</div>
                            <p className="text-gray-500 text-sm">Configure your settings and click <strong className="text-indigo-400">Generate</strong></p>
                        </div>
                    )}

                    {!loading && questions.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {/* Summary bar */}
                            <div className="flex items-center justify-between bg-gray-900/40 border border-white/10 rounded-xl px-4 py-2.5">
                                <div className="flex gap-3 text-xs text-gray-500">
                                    <span className="text-white font-bold">{questions.length}</span> questions
                                    <span>·</span>
                                    <span className="text-indigo-400 font-semibold">{form.role}</span>
                                    <span>·</span>
                                    <span>{form.type}</span>
                                </div>
                                <div className="flex gap-2 text-xs">
                                    <span className="text-emerald-400">{Object.values(practiced).filter(Boolean).length} done</span>
                                    <span className="text-yellow-400">{Object.values(starred).filter(Boolean).length} starred</span>
                                </div>
                            </div>

                            {questions.map((q, i) => (
                                <div key={i}
                                    className={`bg-gray-900/60 border rounded-2xl overflow-hidden transition-all ${practiced[i] ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 hover:border-white/20'
                                        }`}>
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Number */}
                                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-black flex items-center justify-center">
                                                {i + 1}
                                            </span>

                                            <div className="flex-1">
                                                <div className="flex gap-2 mb-2 flex-wrap">
                                                    {q.tag && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">{q.tag}</span>}
                                                    {q.diff && <span className={`text-xs px-2 py-0.5 rounded-full ${diffColor[q.diff] || ''}`}>{q.diff}</span>}
                                                    {practiced[i] && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">✅ Practiced</span>}
                                                </div>

                                                <p className="text-sm text-white leading-relaxed font-medium mb-3">{q.q}</p>

                                                {/* Hint toggle */}
                                                {q.hint && (
                                                    <div>
                                                        <button onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                                                            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                                            {expanded[i] ? '▲ Hide Hint' : '💡 Show Hint'}
                                                        </button>
                                                        {expanded[i] && (
                                                            <div className="mt-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200">
                                                                🎯 <strong>Hint:</strong> {q.hint}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                                                <button onClick={() => toggleStar(i)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm ${starred[i] ? 'text-yellow-400 bg-yellow-500/20' : 'text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10'
                                                        }`}>⭐</button>
                                                <button onClick={() => toggleDone(i)}
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-sm ${practiced[i] ? 'text-emerald-400 bg-emerald-500/20' : 'text-gray-600 hover:text-emerald-400 hover:bg-emerald-500/10'
                                                        }`}>✓</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Export */}
                            <button
                                onClick={() => {
                                    const text = questions.map((q, i) => `Q${i + 1}: ${q.q}${q.hint ? `\nHint: ${q.hint}` : ''}`).join('\n\n');
                                    const blob = new Blob([text], { type: 'text/plain' });
                                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                                    a.download = `questions-${form.role.replace(/ /g, '-')}.txt`; a.click();
                                }}
                                className="w-full py-2.5 border border-white/10 rounded-xl text-xs text-gray-400 hover:text-white hover:border-white/30 transition-all font-semibold">
                                📥 Export Questions as TXT
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
