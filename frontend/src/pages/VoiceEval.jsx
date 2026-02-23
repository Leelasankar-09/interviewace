import { useState, useRef, useEffect } from 'react';
import { FiMic, FiMicOff, FiSend, FiRefreshCw } from 'react-icons/fi';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const sampleQuestions = [
    { id: 1, text: 'Tell me about yourself and your experience.', type: 'HR', level: 'Easy' },
    { id: 2, text: 'Describe a challenging project and how you handled it.', type: 'Behavioral', level: 'Medium' },
    { id: 3, text: 'What is your approach to debugging a production issue?', type: 'Technical', level: 'Medium' },
    { id: 4, text: 'How do you handle disagreements with teammates?', type: 'HR', level: 'Easy' },
];

const mockEvaluation = {
    parameters: [
        { name: 'Relevance', score: 8 }, { name: 'STAR Structure', score: 7 },
        { name: 'Clarity', score: 8 }, { name: 'Tone', score: 9 },
        { name: 'Depth', score: 6 }, { name: 'Vocabulary', score: 8 },
        { name: 'Conciseness', score: 7 }, { name: 'Enthusiasm', score: 9 },
    ],
    overallScore: 77,
    fillerWords: { count: 4, words: ['um', 'basically', 'like'] },
    powerWords: ['Led', 'Implemented', 'Optimized', 'Collaborated'],
    suggestions: [
        'Add specific numbers to quantify your impact',
        'Reduce filler words — you used "basically" 3 times',
        'Strong STAR structure — good use of the Result component',
    ],
    sampleAnswer: 'A stronger version: "In my previous role, I led a team of 4 engineers to migrate our monolith to microservices. I identified bottlenecks, created a phased plan, and we delivered 3 weeks early — reducing deployment time by 60%."',
};

export default function VoiceEval() {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [selectedQ, setSelectedQ] = useState(sampleQuestions[0]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const recognitionRef = useRef(null);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { alert('Speech recognition not supported. Please type your answer.'); return; }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
            const t = Array.from(e.results).map(r => r[0].transcript).join(' ');
            setTranscript(t);
        };
        recognition.onend = () => setListening(false);
        recognition.start();
        recognitionRef.current = recognition;
        setListening(true);
    };

    const stopListening = () => {
        recognitionRef.current?.stop();
        setListening(false);
    };

    const evaluate = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        setResult(mockEvaluation);
        setLoading(false);
    };

    const scoreColor = (s) => s >= 8 ? 'var(--success)' : s >= 6 ? 'var(--warning)' : 'var(--error)';

    return (
        <div className="animate-fade" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚡ Voice & Text Evaluation</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Answer interview questions by voice or text — get AI scoring on 8 real-world parameters</p>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Left: Question + Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Question Selector */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📋 Select Question</h3>
                        {sampleQuestions.map(q => (
                            <div key={q.id} onClick={() => { setSelectedQ(q); setResult(null); setTranscript(''); }}
                                style={{
                                    padding: '0.75rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: '0.5rem',
                                    background: selectedQ.id === q.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-secondary)',
                                    border: `1px solid ${selectedQ.id === q.id ? 'var(--accent)' : 'transparent'}`,
                                    transition: 'all 0.2s',
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <span className={`badge badge-${q.type === 'HR' ? 'info' : q.type === 'Behavioral' ? 'warning' : 'accent'}`} style={{ fontSize: '0.7rem' }}>{q.type}</span>
                                    <span className={`badge badge-${q.level === 'Easy' ? 'success' : 'warning'}`} style={{ fontSize: '0.7rem' }}>{q.level}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{q.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Answer Input */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🎙️ Your Answer</h3>

                        {/* Mic Button */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <button onClick={listening ? stopListening : startListening}
                                style={{
                                    width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                    background: listening ? 'var(--error)' : 'var(--gradient)',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: listening ? '0 0 30px rgba(239,68,68,0.5)' : '0 0 20px rgba(99,102,241,0.4)',
                                    animation: listening ? 'pulse 1s infinite' : 'none',
                                    transition: 'all 0.3s',
                                }}>
                                {listening ? <FiMicOff size={28} /> : <FiMic size={28} />}
                            </button>
                        </div>

                        {listening && (
                            <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
                                <span className="badge badge-error" style={{ animation: 'pulse 1s infinite' }}>🔴 Recording...</span>
                            </div>
                        )}

                        <textarea className="input" rows={6}
                            placeholder="Speak or type your answer here..."
                            value={transcript}
                            onChange={e => setTranscript(e.target.value)}
                            style={{ resize: 'vertical', marginBottom: '1rem' }} />

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-ghost" onClick={() => { setTranscript(''); setResult(null); }} style={{ gap: '0.5rem' }}>
                                <FiRefreshCw size={14} /> Clear
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                                onClick={evaluate} disabled={!transcript.trim() || loading}>
                                {loading ? <><span className="spinner" /> Evaluating...</> : <><FiSend size={14} /> Get AI Feedback</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Results */}
                {result ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Overall Score */}
                        <div className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 900, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
                                {result.overallScore}/100
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Overall Interview Score</p>
                        </div>

                        {/* Radar */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📊 Parameter Breakdown</h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={result.parameters}>
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                    <Radar dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3} strokeWidth={2} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {result.parameters.map(p => (
                                    <div key={p.name} style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: 6, background: 'var(--bg-secondary)' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{p.name}: </span>
                                        <span style={{ fontWeight: 700, color: scoreColor(p.score) }}>{p.score}/10</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filler + Power Words */}
                        <div className="grid-2" style={{ gap: '1rem' }}>
                            <div className="card" style={{ padding: '1rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--error)' }}>⚠️ Filler Words ({result.fillerWords.count})</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                    {result.fillerWords.words.map(w => <span key={w} className="badge badge-error" style={{ fontSize: '0.72rem' }}>{w}</span>)}
                                </div>
                            </div>
                            <div className="card" style={{ padding: '1rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--success)' }}>✨ Power Words</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                    {result.powerWords.map(w => <span key={w} className="badge badge-success" style={{ fontSize: '0.72rem' }}>{w}</span>)}
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="card">
                            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>💡 Suggestions</h3>
                            {result.suggestions.map((s, i) => (
                                <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem', borderRadius: 6, background: 'var(--bg-secondary)', marginBottom: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>{i + 1}.</span> {s}
                                </div>
                            ))}
                        </div>

                        {/* Sample Answer */}
                        <div className="card" style={{ border: '1px solid var(--border-accent)', background: 'var(--gradient-card)' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>🌟 Stronger Sample Answer</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.sampleAnswer}</p>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Record or type your answer<br />to see detailed AI feedback</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
