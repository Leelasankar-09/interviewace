import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { saveSession } from '../store/sessionStore';

// ─── Question Bank ────────────────────────────────────────────
const QUESTIONS = [
    { id: 1, cat: 'Leadership', q: 'Tell me about a time you led a team through a difficult project.', tips: ['Set the context', 'Describe your leadership actions', 'Quantify the outcome'] },
    { id: 2, cat: 'Conflict', q: 'Describe a situation where you had a disagreement with a coworker. How did you resolve it?', tips: ['Stay neutral', 'Focus on listening', 'Show the resolution'] },
    { id: 3, cat: 'Failure', q: 'Tell me about your biggest professional failure and what you learned from it.', tips: ['Be honest', 'Own the mistake', 'Emphasize the lesson'] },
    { id: 4, cat: 'Achievement', q: 'What is the most significant project you have delivered? Walk me through it.', tips: ['Use metrics', 'Highlight your contribution', 'Describe impact'] },
    { id: 5, cat: 'Adaptability', q: 'Tell me about a time you had to adapt quickly to a major change at work.', tips: ['Show flexibility', 'Describe your thought process', 'Outcome focus'] },
    { id: 6, cat: 'Pressure', q: 'Describe a time you worked under a very tight deadline. How did you manage it?', tips: ['Prioritization', 'Resource management', 'Result'] },
    { id: 7, cat: 'Initiative', q: 'Give an example of when you went above and beyond what was expected.', tips: ['Show proactiveness', 'Describe impact', 'Tie to team/company goals'] },
    { id: 8, cat: 'Teamwork', q: 'Tell me about a time you collaborated with someone who had a very different working style.', tips: ['Empathy', 'Communication', 'Shared outcome'] },
    { id: 9, cat: 'Problem Solving', q: 'Describe the hardest technical problem you have solved and your approach.', tips: ['Walk through your reasoning', 'Show debugging skills', 'Quantify result'] },
    { id: 10, cat: 'Communication', q: 'Tell me about a time you had to explain a complex concept to a non-technical stakeholder.', tips: ['Show simplification skills', 'Check for understanding', 'Outcome'] },
];

const CAT_COLORS = {
    Leadership: '#6366f1', Conflict: '#ec4899', Failure: '#ef4444',
    Achievement: '#10b981', Adaptability: '#f59e0b', Pressure: '#f97316',
    Initiative: '#8b5cf6', Teamwork: '#06b6d4', 'Problem Solving': '#3b82f6', Communication: '#14b8a6',
};

// ─── NLP Scorer ───────────────────────────────────────────────
const STAR_KEYWORDS = {
    situation: ['when', 'while', 'was', 'working', 'project', 'time', 'during', 'at', 'my'],
    task: ['responsible', 'tasked', 'needed', 'had to', 'required', 'goal', 'objective', 'challenge'],
    action: ['decided', 'implemented', 'developed', 'built', 'led', 'created', 'initiated', 'proposed', 'organized', 'coordinated', 'resolved'],
    result: ['resulted', 'achieved', 'improved', 'reduced', 'increased', '%', 'percent', 'saved', 'successfully', 'outcome', 'completed'],
};

function scoreAnswer(text) {
    if (!text.trim()) return null;
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    const wc = words.length;

    // STAR detection
    const star = {};
    Object.entries(STAR_KEYWORDS).forEach(([key, kws]) => {
        star[key] = kws.filter(k => lower.includes(k)).length;
    });
    const starScore = Math.min(100, (
        Math.min(star.situation, 3) * 5 +
        Math.min(star.task, 3) * 5 +
        Math.min(star.action, 5) * 7 +
        Math.min(star.result, 4) * 10
    ));

    // Word count score (ideal: 100-200 words)
    const wcScore = wc < 30 ? 20 : wc < 60 ? 45 : wc < 100 ? 70 : wc <= 220 ? 100 : Math.max(40, 100 - (wc - 220) / 5);

    // Specificity (numbers, metrics, names)
    const hasNumbers = /\d+/.test(text);
    const hasPercent = /%|percent/.test(lower);
    const specificityScore = Math.min(100, (hasNumbers ? 40 : 0) + (hasPercent ? 30 : 0) + (wc > 80 ? 30 : 15));

    // Filler check
    const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually'];
    const fillerCount = fillers.filter(f => lower.includes(f)).length;
    const clarityScore = Math.max(20, 100 - fillerCount * 15);

    // Confidence words
    const powerWords = ['achieved', 'led', 'delivered', 'succeeded', 'built', 'created', 'innovated', 'resolved'];
    const powerCount = powerWords.filter(p => lower.includes(p)).length;
    const confidenceScore = Math.min(100, 40 + powerCount * 15);

    const overall = Math.round(starScore * 0.35 + wcScore * 0.2 + specificityScore * 0.2 + clarityScore * 0.15 + confidenceScore * 0.1);

    return {
        overall,
        grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 55 ? 'C' : 'D',
        wc,
        radar: [
            { name: 'STAR Structure', score: starScore },
            { name: 'Length', score: Math.round(wcScore) },
            { name: 'Specificity', score: specificityScore },
            { name: 'Clarity', score: clarityScore },
            { name: 'Confidence', score: confidenceScore },
        ],
        star,
        fillerCount,
        powerCount,
        feedback: buildFeedback(starScore, wc, hasNumbers, fillerCount, powerCount),
    };
}

function buildFeedback(starScore, wc, hasNumbers, fillers, power) {
    const tips = [];
    if (starScore < 50) tips.push('❌ Structure your answer using the STAR method (Situation → Task → Action → Result)');
    else if (starScore < 75) tips.push('⚠️ Good STAR structure — add more detail to your Action and Result sections');
    else tips.push('✅ Excellent STAR structure!');

    if (wc < 60) tips.push('❌ Answer too short — aim for 100–200 words for a complete response');
    else if (wc > 250) tips.push('⚠️ Answer is a bit long — try to be more concise (target ~150 words)');
    else tips.push('✅ Good answer length');

    if (!hasNumbers) tips.push('💡 Add specific numbers/metrics to make your impact measurable (e.g., "reduced by 30%")');
    else tips.push('✅ Great use of specific metrics!');

    if (fillers > 1) tips.push(`⚠️ Detected ${fillers} filler phrase(s) — practice reducing "um", "like", "basically"`);
    if (power < 2) tips.push('💡 Use stronger action verbs like "led", "achieved", "delivered", "resolved"');
    else tips.push('✅ Good use of power words');

    return tips;
}

const GRADE_COLOR = { A: '#10b981', B: '#6366f1', C: '#f59e0b', D: '#ef4444' };

export default function Behavioral() {
    const [selQ, setSelQ] = useState(QUESTIONS[0]);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState(null);
    const [saved, setSaved] = useState(false);
    const [catFilter, setCatFilter] = useState('All');

    const cats = ['All', ...new Set(QUESTIONS.map(q => q.cat))];
    const filtered = catFilter === 'All' ? QUESTIONS : QUESTIONS.filter(q => q.cat === catFilter);

    const analyse = () => {
        const r = scoreAnswer(answer);
        if (!r) return;
        setResult(r);
        setSaved(false);
        saveSession({
            session_type: 'behavioral',
            question_text: selQ.q,
            question_type: selQ.cat,
            overall_score: r.overall,
            grade: r.grade,
            word_count: r.wc,
            filler_count: r.fillerCount,
            dim_scores: Object.fromEntries(r.radar.map(x => [x.name.toLowerCase(), x.score])),
        });
    };

    const reset = () => { setAnswer(''); setResult(null); setSaved(false); };

    const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    const wcColor = wc < 60 ? '#ef4444' : wc <= 220 ? '#10b981' : '#f59e0b';

    return (
        <div className="animate-fade" style={{ maxWidth: 1300, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem' }}>🎤 Behavioral Interview</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    STAR method practice — write your answer and get instant AI scoring across 5 dimensions
                </p>
            </div>

            <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
                {/* ── LEFT: Question Picker ────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Category filter */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {cats.map(c => (
                            <button key={c} onClick={() => setCatFilter(c)}
                                style={{
                                    padding: '0.3rem 0.75rem', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
                                    border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s',
                                    background: catFilter === c ? 'var(--accent)' : 'transparent',
                                    color: catFilter === c ? '#fff' : 'var(--text-muted)',
                                }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Question list */}
                    <div className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 420, overflowY: 'auto' }}>
                        {filtered.map(q => (
                            <button key={q.id} onClick={() => { setSelQ(q); reset(); }}
                                style={{
                                    textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid transparent',
                                    cursor: 'pointer', transition: 'all 0.2s', background: 'transparent',
                                    ...(selQ.id === q.id
                                        ? { background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.4)' }
                                        : { color: 'var(--text-secondary)' }),
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 100,
                                        background: `${CAT_COLORS[q.cat]}25`, color: CAT_COLORS[q.cat]
                                    }}>{q.cat}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', lineHeight: 1.4, margin: 0 }}>{q.q}</p>
                            </button>
                        ))}
                    </div>

                    {/* Tips card */}
                    <div className="card" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.2)' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.5rem' }}>💡 STAR Tips for this Question</p>
                        {selQ.tips.map((t, i) => (
                            <p key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>• {t}</p>
                        ))}
                    </div>
                </div>

                {/* ── RIGHT: Answer + Results ──────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Active question */}
                    <div className="card" style={{ borderLeft: `3px solid ${CAT_COLORS[selQ.cat]}`, borderRadius: 'var(--radius)' }}>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 100,
                            background: `${CAT_COLORS[selQ.cat]}20`, color: CAT_COLORS[selQ.cat], display: 'inline-block', marginBottom: '0.5rem'
                        }}>{selQ.cat}</span>
                        <p style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.5 }}>{selQ.q}</p>
                    </div>

                    {/* Textarea */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Your Answer (STAR format)</label>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: wcColor }}>{wc} words</span>
                        </div>
                        <textarea className="input" rows={9}
                            placeholder={`Structure your answer:\n\nSituation: Set the scene...\nTask: What was your responsibility...\nAction: What specific steps did you take...\nResult: What was the measurable outcome...`}
                            value={answer} onChange={e => setAnswer(e.target.value)}
                            style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }}
                            onClick={analyse} disabled={wc < 10}>
                            🔍 Score My Answer
                        </button>
                        {result && (
                            <button className="btn btn-ghost" onClick={reset} style={{ padding: '0.8rem 1.25rem' }}>
                                🔄 Reset
                            </button>
                        )}
                    </div>

                    {/* Results */}
                    {result && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fade 0.4s ease' }}>
                            {/* Overall */}
                            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: GRADE_COLOR[result.grade] }}>{result.grade}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grade</div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: GRADE_COLOR[result.grade] }}>{result.overall}/100</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{result.wc} words • {result.fillerCount} fillers • {result.powerCount} power words</div>
                                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${result.overall}%`, background: GRADE_COLOR[result.grade], borderRadius: 3, transition: 'width 0.8s ease' }} />
                                    </div>
                                </div>
                                {saved && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✅ Saved</span>}
                            </div>

                            {/* Radar */}
                            <div className="card">
                                <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>5-Dimension Score</p>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart data={result.radar} outerRadius={70}>
                                        <PolarGrid stroke="var(--border)" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                                        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                                        <Tooltip formatter={(v) => [`${v}/100`]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Feedback */}
                            <div className="card">
                                <p style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>📋 Feedback</p>
                                {result.feedback.map((f, i) => (
                                    <p key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{f}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
