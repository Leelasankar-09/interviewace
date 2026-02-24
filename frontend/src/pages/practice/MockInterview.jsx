import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { mockAPI, analyticsAPI } from '../api/services';

const ROLES = ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack', 'Data Scientist', 'Product Manager', 'DevOps Engineer'];
const ROUND_TYPES = ['Technical', 'Behavioral', 'HR', 'System Design'];

const STARTER_QUESTIONS = {
    Technical: ["Tell me about a technically complex project you've built.", "Explain how you'd design a scalable REST API.", "Walk me through your debugging process."],
    Behavioral: ["Tell me about yourself.", "Describe a challenging project you worked on.", "How do you handle tight deadlines?"],
    HR: ["Why do you want this role?", "Where do you see yourself in 5 years?", "What are your greatest strengths?"],
    'System Design': ["Design a URL shortener like bit.ly.", "Design a notification system for millions of users.", "Design a rate limiter."],
};

export default function MockInterview() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [phase, setPhase] = useState('setup'); // setup | interview | summary
    const [role, setRole] = useState('Software Engineer');
    const [roundType, setRoundType] = useState('Technical');
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [sessionSaved, setSessionSaved] = useState(false);
    const [sessionStats, setSessionStats] = useState(null);
    const bottomRef = useRef(null);
    const abortRef = useRef(null);

    useEffect(() => {
        analyticsAPI.track('page_view', '/mock', null, { role });
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startInterview = () => {
        const starters = STARTER_QUESTIONS[roundType] || STARTER_QUESTIONS.Technical;
        const opener = starters[Math.floor(Math.random() * starters.length)];
        setMessages([
            {
                role: 'assistant',
                content: `👋 Welcome to your **${roundType}** interview for the **${role}** role. I'm your AI interviewer today.\n\n**First question:**\n\n${opener}`,
            },
        ]);
        setPhase('interview');
        analyticsAPI.track('feature_use', '/mock', 'start_mock_interview', { role, roundType });
    };

    const sendMessage = async () => {
        if (!input.trim() || isStreaming) return;
        const userMsg = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsStreaming(true);

        // Build history in Claude format (exclude system-formatted first message)
        const history = newMessages.slice(0, -1).map(m => ({
            role: m.role,
            content: m.content,
        }));

        let aiResponse = '';
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/mock/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${JSON.parse(localStorage.getItem('interviewace-auth') || '{}')?.state?.token || ''}`,
                },
                body: JSON.stringify({ history, message: input.trim(), role, round_type: roundType }),
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantMsg = { role: 'assistant', content: '' };
            setMessages(prev => [...prev, assistantMsg]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                aiResponse += chunk;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: aiResponse };
                    return updated;
                });
            }
        } catch (err) {
            toast.error('Connection error. Please try again.');
        } finally {
            setIsStreaming(false);
        }
    };

    const endInterview = async () => {
        setPhase('summary');
        analyticsAPI.track('feature_use', '/mock', 'end_mock_interview', { messageCount: messages.length });

        // Save session to DB
        const myAnswers = messages.filter(m => m.role === 'user');
        const combinedAnswer = myAnswers.map(m => m.content).join('\n\n');
        const firstQ = messages.find(m => m.role === 'assistant')?.content || '';

        setSessionStats({
            totalMessages: messages.length,
            myAnswers: myAnswers.length,
            wordCount: combinedAnswer.split(' ').length,
        });

        try {
            await mockAPI.save({
                question_text: firstQ.slice(0, 300),
                answer_text: combinedAnswer.slice(0, 3000),
                round_type: roundType,
                role_tag: role,
                conversation: messages,
            });
            setSessionSaved(true);
            toast.success('Interview session saved!');
        } catch (err) {
            toast.error('Could not save session.');
        }
    };

    const cs = { background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem' };

    if (phase === 'setup') return (
        <div className="animate-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>🎭 Mock Interview</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Simulate a real interview with an AI interviewer that asks follow-up questions</p>

            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Target Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem' }}>
                        {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Interview Round</label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {ROUND_TYPES.map(rt => (
                            <button key={rt} onClick={() => setRoundType(rt)}
                                style={{
                                    padding: '0.6rem 1.2rem', borderRadius: '2rem', border: '2px solid', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                    borderColor: roundType === rt ? 'var(--accent)' : 'var(--border)',
                                    background: roundType === rt ? 'var(--accent)' : 'transparent',
                                    color: roundType === rt ? '#fff' : 'var(--text-primary)'
                                }}>
                                {rt}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    💡 The AI will ask you a question, then follow up based on your answers — just like a real interview!
                </div>

                <button onClick={startInterview}
                    style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>
                    🚀 Start Interview
                </button>
            </div>
        </div>
    );

    if (phase === 'summary') return (
        <div className="animate-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>📊 Interview Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Here's how your session went</p>

            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        { label: 'Total Exchanges', value: sessionStats?.totalMessages || 0, emoji: '💬' },
                        { label: 'Your Answers', value: sessionStats?.myAnswers || 0, emoji: '🗣️' },
                        { label: 'Total Words', value: sessionStats?.wordCount || 0, emoji: '📝' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                            <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{s.emoji}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
                {sessionSaved && <div style={{ padding: '0.75rem 1rem', background: '#dcfce7', borderRadius: '0.5rem', color: '#166534', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ✅ Session saved to your history
                </div>}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setPhase('setup')}
                        style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: '2px solid var(--accent)', background: 'transparent', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                        🔄 New Interview
                    </button>
                    <button onClick={() => navigate('/history')}
                        style={{ flex: 1, padding: '0.85rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                        📚 View History
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="animate-fade" style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>🎭 {roundType} Interview — {role}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{messages.length} messages exchanged</p>
                </div>
                <button onClick={endInterview}
                    style={{ padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: '2px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                    🏁 End Interview
                </button>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        <div style={{
                            maxWidth: '75%', padding: '1rem 1.25rem', borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                            background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                            fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        }}>
                            {msg.role === 'assistant' && <div style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--accent)' }}>🤖 AI Interviewer</div>}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isStreaming && (
                    <div style={{ display: 'flex', gap: '0.4rem', padding: '1rem', alignItems: 'center' }}>
                        {[0, 150, 300].map(d => (
                            <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1s ease-in-out ${d}ms infinite` }} />
                        ))}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
                    rows={3}
                    style={{ flex: 1, padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'none', fontSize: '0.95rem' }}
                />
                <button onClick={sendMessage} disabled={isStreaming || !input.trim()}
                    style={{ padding: '0 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: isStreaming || !input.trim() ? 0.5 : 1 }}>
                    Send
                </button>
            </div>
        </div>
    );
}
