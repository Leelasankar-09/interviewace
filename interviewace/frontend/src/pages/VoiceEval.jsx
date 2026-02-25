import { useState, useRef, useEffect, useCallback } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';
import { saveSession } from '../store/sessionStore';

// ─── Constants ────────────────────────────────────────────────
const FILLERS_HEAVY = ['uhm', 'um', 'uh', 'hmm', 'er', 'ah', 'emm'];
const FILLERS_MEDIUM = ['basically', 'literally', 'honestly', 'actually', 'i mean', 'sort of', 'kind of'];
const FILLERS_MILD = ['like', 'you know', 'so', 'well', 'okay', 'right'];
const ALL_FILLERS = [...FILLERS_HEAVY, ...FILLERS_MEDIUM, ...FILLERS_MILD];

const POWER_WORDS = ['implemented', 'led', 'built', 'designed', 'optimized', 'achieved', 'delivered',
    'managed', 'created', 'developed', 'improved', 'increased', 'reduced', 'launched', 'collaborated',
    'architected', 'spearheaded', 'mentored', 'exceeded', 'directed'];

const STAR = {
    situation: ['situation', 'context', 'background', 'when i was', 'at my previous', 'in my role'],
    task: ['task', 'responsibility', 'challenge', 'goal', 'objective', 'assigned to'],
    action: ['i decided', 'i implemented', 'i built', 'i led', 'i worked', 'i created', 'i resolved'],
    result: ['result', 'outcome', 'achieved', 'reduced by', 'increased by', 'improved by', '% ', 'percent'],
};

// ─── NLP Engine (local, pretrained-quality) ──────────────────
function nlpEval(text, questionType = 'Behavioral') {
    if (!text?.trim()) return null;
    const lower = text.toLowerCase();
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const wc = words.length;
    const uniqueRatio = new Set(words.map(w => w.toLowerCase())).size / Math.max(wc, 1);

    // Filler detection with severity
    const fillerMap = {};
    ALL_FILLERS.forEach(f => {
        const matches = lower.match(new RegExp(`\\b${f.replace(/\s/g, '\\s+')}\\b`, 'g')) || [];
        if (matches.length) {
            const severity = FILLERS_HEAVY.includes(f) ? 3 : FILLERS_MEDIUM.includes(f) ? 2 : 1;
            fillerMap[f] = { count: matches.length, severity, category: FILLERS_HEAVY.includes(f) ? 'vocal' : 'verbal' };
        }
    });
    const fillers = Object.entries(fillerMap).map(([word, d]) => ({ word, ...d }))
        .sort((a, b) => b.severity * b.count - a.severity * a.count);

    const fillerPenalty = fillers.reduce((s, f) => s + f.count * f.severity * 0.25, 0);
    const voiceFillers = fillers.filter(f => f.category === 'vocal');
    const voiceCount = voiceFillers.reduce((s, f) => s + f.count, 0);

    // Power words
    const foundPower = POWER_WORDS.filter(w => lower.includes(w));

    // STAR check
    const starCheck = {};
    Object.entries(STAR).forEach(([k, kws]) => {
        starCheck[k] = kws.some(kw => lower.includes(kw));
    });
    const starFilled = Object.values(starCheck).filter(Boolean).length;

    // Readability (Flesch approximation)
    const syllables = words.reduce((s, w) => s + Math.max(1, (w.match(/[aeiou]+/gi) || []).length), 0);
    const avgSyl = syllables / Math.max(wc, 1);
    const avgSenLen = wc / Math.max(sentences, 1);
    const flesch = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSenLen - 84.6 * avgSyl));

    // Quantification check
    const hasNumbers = /\d+\s*(%|percent|x\b|times|users|hours|days|weeks|months|k\b|m\b)/.test(lower);
    const hasSpecifics = /(for example|specifically|in particular|such as|including)/i.test(text);

    // ── Dimension Scores (each 0-10) ──────────────────────────
    const relevance = Math.min(10, 3 + Math.min(5, wc / 20) + (hasNumbers ? 1.5 : 0) + (hasSpecifics ? 0.5 : 0));
    const starScore = starFilled * 2.5;
    const clarity = Math.max(0, Math.min(10, flesch / 10 - fillerPenalty));
    const posWords = ['excellent', 'great', 'proud', 'excited', 'passionate', 'succeeds', 'achieved', 'thrilled'].filter(w => lower.includes(w)).length;
    const tone = Math.min(10, Math.max(0, 5 + posWords + foundPower.length * 0.3 - voiceCount * 0.4));
    const depth = Math.min(10, 3 + Math.min(4, wc / 30) + (hasNumbers ? 2.5 : 0) + (hasSpecifics ? 0.5 : 0));
    const vocabulary = Math.min(10, 4 + uniqueRatio * 5 + Math.min(2, foundPower.length * 0.3));
    const idealWc = questionType === 'Technical' ? 200 : 150;
    const conciseness = Math.max(3, 10 - Math.abs(wc - idealWc) / idealWc * 5);
    const enthusiasm = Math.min(10, 5 + foundPower.length * 0.3 + (text.includes('!') ? 1 : 0) + posWords * 0.4);

    const dims = { relevance, starScore: Math.min(10, starScore), clarity, tone, depth, vocabulary, conciseness, enthusiasm };

    // ── Weighted Overall (0-100) ──────────────────────────────
    const W = { relevance: 0.18, starScore: 0.15, clarity: 0.15, tone: 0.10, depth: 0.18, vocabulary: 0.10, conciseness: 0.07, enthusiasm: 0.07 };
    const overall = Math.min(100, Math.max(0,
        Object.entries(dims).reduce((s, [k, v]) => s + (W[k] || 0) * v * 10, 0)
    ));

    const grade = overall >= 88 ? 'A+' : overall >= 80 ? 'A' : overall >= 73 ? 'B+' : overall >= 65 ? 'B' : overall >= 55 ? 'C+' : overall >= 45 ? 'C' : 'D';

    // Radar data
    const radar = [
        { name: 'Relevance', score: Math.round(dims.relevance * 10) },
        { name: 'STAR', score: Math.round(dims.starScore * 10) },
        { name: 'Clarity', score: Math.round(dims.clarity * 10) },
        { name: 'Tone', score: Math.round(dims.tone * 10) },
        { name: 'Depth', score: Math.round(dims.depth * 10) },
        { name: 'Vocabulary', score: Math.round(dims.vocabulary * 10) },
        { name: 'Conciseness', score: Math.round(dims.conciseness * 10) },
        { name: 'Enthusiasm', score: Math.round(dims.enthusiasm * 10) },
    ];

    // Strengths + improvements
    const strengths = [], improvements = [];
    const TIPS = {
        relevance: 'Add more context — answer is too brief',
        starScore: 'Use STAR method: Situation → Task → Action → Result',
        clarity: 'Reduce uhm/um — pause silently instead of filling gaps',
        tone: 'Use positive action language: "I led", "I achieved"',
        depth: 'Add numbers: "reduced by 40%", "served 10K users"',
        vocabulary: 'Use power verbs: implemented, optimized, delivered',
        conciseness: 'Aim for 120-180 words — be precise',
        enthusiasm: 'Show more passion — energy is contagious in interviews',
    };
    Object.entries(dims).forEach(([k, v]) => {
        if (v >= 7.5) strengths.push(k.replace('Score', '').replace(/([A-Z])/g, ' $1').trim());
        else if (v < 5) improvements.push(TIPS[k]);
    });

    return {
        overall: Math.round(overall * 10) / 10,
        grade,
        dims,
        radar,
        fillers,
        voiceCount,
        foundPower,
        starCheck,
        starFilled,
        readability: { wc, sentences, flesch: Math.round(flesch), avgSenLen: Math.round(avgSenLen, 1) },
        hasNumbers,
        strengths: strengths.slice(0, 3),
        improvements: improvements.slice(0, 3),
    };
}

// Per-minute segment scorer
function minuteScore(segText, minuteNum) {
    const words = segText.trim().split(/\s+/).filter(Boolean);
    const wpm = words.length;
    const lower = segText.toLowerCase();
    const fillerCount = ALL_FILLERS.reduce((s, f) => s + (lower.match(new RegExp(`\\b${f}\\b`, 'g')) || []).length, 0);
    const voiceCount = FILLERS_HEAVY.reduce((s, f) => s + (lower.match(new RegExp(`\\b${f}\\b`, 'g')) || []).length, 0);
    const fDensity = fillerCount / Math.max(wpm, 1);

    const paceScore = Math.max(20, 100 - Math.abs(wpm - 130) * 0.5);
    const fillerScore = Math.max(0, 100 - fDensity * 300 - voiceCount * 8);
    const score = Math.round(paceScore * 0.35 + fillerScore * 0.65);

    const issues = [];
    if (voiceCount >= 3) issues.push(`${voiceCount}× uhm/um heard`);
    if (fillerCount >= 5) issues.push(`${fillerCount} filler words`);
    if (wpm < 50) issues.push('Too slow');
    else if (wpm > 200) issues.push('Too fast');

    return {
        minute: minuteNum,
        score,
        wpm,
        fillerCount,
        voiceCount,
        issues,
        label: score >= 80 ? '🟢 Great' : score >= 60 ? '🟡 OK' : '🔴 Needs work',
    };
}

// ─── Waveform Visualizer ─────────────────────────────────────
function WaveformCanvas({ isRecording, analyserRef }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    useEffect(() => {
        if (!isRecording || !analyserRef?.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const arr = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(arr);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
            grad.addColorStop(0, '#6366f1'); grad.addColorStop(0.5, '#ec4899'); grad.addColorStop(1, '#6366f1');
            ctx.lineWidth = 2.5; ctx.strokeStyle = grad; ctx.shadowBlur = 14; ctx.shadowColor = '#6366f188';
            ctx.beginPath();
            const sw = canvas.width / arr.length;
            arr.forEach((v, i) => {
                const y = (v / 128) * (canvas.height / 2);
                i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * sw, y);
            });
            ctx.stroke();
        };
        draw();
        return () => cancelAnimationFrame(rafRef.current);
    }, [isRecording]);
    return (
        <canvas ref={canvasRef} width={600} height={72}
            className={`w-full rounded-xl transition-all border ${isRecording ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02]'}`} />
    );
}

// ─── Score Ring ───────────────────────────────────────────────
function ScoreRing({ score, size = 120, label = '' }) {
    const r = (size - 14) / 2, circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <svg width={size} height={size} className="drop-shadow-xl">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12}
                strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ filter: `drop-shadow(0 0 8px ${color}88)`, transition: 'stroke-dasharray 1s ease' }} />
            <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fill="white" fontSize={size < 100 ? 16 : 22} fontWeight={800}>{Math.round(score)}</text>
            <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="#6b7280" fontSize={10}>{label || '/100'}</text>
        </svg>
    );
}

const SAMPLE_QS = [
    { id: 1, q: 'Tell me about yourself and your experience.', type: 'HR' },
    { id: 2, q: 'Describe a challenging project you worked on.', type: 'Behavioral' },
    { id: 3, q: 'How do you handle disagreements with teammates?', type: 'Behavioral' },
    { id: 4, q: 'What is your biggest technical achievement?', type: 'Technical' },
    { id: 5, q: 'Where do you see yourself in 5 years?', type: 'HR' },
];

export default function VoiceEval() {
    const [selQ, setSelQ] = useState(SAMPLE_QS[0]);
    const [transcript, setTranscript] = useState('');
    const [interim, setInterim] = useState('');
    const [isRec, setIsRec] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [timer, setTimer] = useState(0);
    const [result, setResult] = useState(null);
    const [saved, setSaved] = useState(false);
    const [minuteLogs, setMinuteLogs] = useState([]);     // per-minute scores
    const [liveMini, setLiveMini] = useState(null);   // current minute mini-result

    const recogRef = useRef(null);
    const mrRef = useRef(null);
    const analyserRef = useRef(null);
    const audioCtxRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const minuteRef = useRef(null);         // minute interval
    const prevTxRef = useRef('');           // transcript at last minute boundary

    const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    // ── Start ─────────────────────────────────────────────────
    const start = useCallback(async () => {
        setTranscript(''); setInterim(''); setAudioBlob(null); setAudioUrl(null);
        setResult(null); setSaved(false); setTimer(0); setMinuteLogs([]); setLiveMini(null);
        chunksRef.current = []; prevTxRef.current = '';

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(e => { alert('Mic: ' + e.message); return null; });
        if (!stream) return;
        streamRef.current = stream;

        // Web Audio
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtxRef.current.createMediaStreamSource(stream);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 1024;
        src.connect(analyser);
        analyserRef.current = analyser;

        // MediaRecorder
        const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        const mr = new MediaRecorder(stream, { mimeType: mime });
        mr.ondataavailable = e => { if (e.data.size) chunksRef.current.push(e.data); };
        mr.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mime });
            setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob));
        };
        mr.start(200); mrRef.current = mr;

        // Speech Recognition
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SR) {
            const recog = new SR(); recog.continuous = true; recog.interimResults = true; recog.lang = 'en-US';
            recog.onresult = ev => {
                let fin = '', int = '';
                for (let i = 0; i < ev.results.length; i++) {
                    const t = ev.results[i][0].transcript;
                    ev.results[i].isFinal ? (fin += t + ' ') : (int += t);
                }
                setTranscript(fin); setInterim(int);
            };
            recog.start(); recogRef.current = recog;
        }

        setIsRec(true);
        timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);

        // ── Per-minute evaluation ─────────────────────────────
        minuteRef.current = setInterval(() => {
            setTranscript(currentTx => {
                const minuteNum = Math.floor(timer / 60) + 1;
                const segment = currentTx.slice(prevTxRef.current.length);
                prevTxRef.current = currentTx;
                if (segment.trim().split(/\s+/).length > 5) {
                    const ms = minuteScore(segment, minuteNum);
                    setLiveMini(ms);
                    setMinuteLogs(logs => [...logs, ms]);
                }
                return currentTx;
            });
        }, 60000);
    }, [timer]);

    // ── Stop ─────────────────────────────────────────────────
    const stop = useCallback(() => {
        clearInterval(timerRef.current); clearInterval(minuteRef.current);
        recogRef.current?.stop(); mrRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        audioCtxRef.current?.close();
        setInterim(''); setIsRec(false);
    }, []);

    useEffect(() => () => stop(), []);

    // ── Full Analyse + auto-persist locally ──────────────────
    const analyse = () => {
        const r = nlpEval(transcript, selQ.type);
        if (!r) return;
        setResult(r);
        // Persist to localStorage immediately
        saveSession({
            session_type: 'voice',
            question_text: selQ.q,
            question_type: selQ.type,
            overall_score: r.overall,
            grade: r.grade,
            duration_secs: timer,
            word_count: r.readability.wc,
            filler_count: r.fillers.reduce((s, f) => s + f.count, 0),
            vocal_filler_count: r.voiceCount,
            star_fulfilled: r.starFilled,
            dim_scores: Object.fromEntries(r.radar.map(x => [x.name.toLowerCase(), x.score])),
            minute_logs: minuteLogs,
        });
    };

    // ── Save audio to backend ─────────────────────────────────
    const save = async () => {
        if (!audioBlob) return;
        const form = new FormData();
        form.append('audio', audioBlob, `rec-${Date.now()}.webm`);
        form.append('question_id', selQ.id.toString());
        form.append('question_text', selQ.q);
        form.append('question_type', selQ.type);
        form.append('transcript', transcript);
        form.append('duration_secs', timer.toString());
        form.append('minute_logs', JSON.stringify(minuteLogs));
        form.append('user_id', 'guest'); // replace with real user id when auth done
        try {
            const res = await fetch(`${API}/voice/save`, { method: 'POST', body: form });
            if (res.ok) {
                const data = await res.json();
                console.log('Saved to backend:', data.session_id);
            }
        } catch (e) {
            console.log('Backend offline — recording saved locally only');
        }
        setSaved(true);
    };

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const scoreColor = v => v >= 75 ? 'text-emerald-400' : v >= 55 ? 'text-yellow-400' : 'text-red-400';
    const scoreBg = v => v >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : v >= 55 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

    return (
        <div className="animate-[fadeIn_0.4s_ease] max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">⚡ Voice Interview Evaluator</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Real-time filler detection · Per-minute scoring · 8-parameter analysis
                    </p>
                </div>
                {liveMini && (
                    <div className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-3 ${scoreBg(liveMini.score)}`}>
                        <span className="text-gray-400">Min {liveMini.minute}</span>
                        <span className={scoreColor(liveMini.score)}>{liveMini.score}/100</span>
                        <span className="text-gray-400">{liveMini.label}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                {/* ── LEFT: Config + Recorder (2 cols) ─────────────── */}
                <div className="xl:col-span-2 flex flex-col gap-4">

                    {/* Question selector */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Question</p>
                        <div className="flex flex-col gap-1.5">
                            {SAMPLE_QS.map(q => (
                                <button key={q.id} onClick={() => { setSelQ(q); setResult(null); setTranscript(''); }}
                                    className={`text-left p-2.5 rounded-xl text-xs transition-all ${selQ.id === q.id ? 'bg-indigo-500/15 border border-indigo-500/40 text-white' : 'text-gray-400 hover:bg-white/5 border border-transparent'}`}>
                                    <span className={`mr-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${q.type === 'HR' ? 'bg-blue-500/20 text-blue-300'
                                            : q.type === 'Technical' ? 'bg-orange-500/20 text-orange-300'
                                                : 'bg-purple-500/20 text-purple-300'
                                        }`}>{q.type}</span>
                                    {q.q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recorder */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recorder</p>
                            <span className={`font-mono text-2xl font-black ${isRec ? 'text-red-400' : 'text-gray-700'}`}>{fmt(timer)}</span>
                        </div>

                        {/* Waveform */}
                        <div className="mb-3"><WaveformCanvas isRecording={isRec} analyserRef={analyserRef} /></div>

                        {/* Mic button */}
                        <div className="flex justify-center mb-3">
                            <button onClick={isRec ? stop : start}
                                className={`w-16 h-16 rounded-full text-2xl text-white flex items-center justify-center transition-all duration-300 ${isRec ? 'bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.5)] scale-105' : 'bg-gradient-to-br from-indigo-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-110'
                                    }`}>
                                {isRec ? '⏹' : '🎙'}
                            </button>
                        </div>

                        {isRec && (
                            <p className="text-center text-xs text-red-400 font-semibold mb-2">
                                🔴 Recording • Scored every 60s
                            </p>
                        )}
                        {interim && (
                            <p className="text-xs text-gray-600 italic border border-white/5 rounded-lg p-2 bg-white/[0.02]">
                                <span className="text-gray-500">Hearing: </span>{interim}
                            </p>
                        )}

                        {audioUrl && (
                            <div className="mt-3 space-y-2">
                                <audio controls src={audioUrl} className="w-full h-8 rounded-lg" />
                                <button onClick={save}
                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
                                        }`}>
                                    {saved ? '✅ Saved' : '💾 Save Recording'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Transcript */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transcript</p>
                            <span className="text-xs text-gray-600">{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                        <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={5}
                            placeholder="Speak or type your answer..."
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500/50 font-mono leading-relaxed" />
                        <div className="flex gap-2 mt-2">
                            <button onClick={() => { setTranscript(''); setResult(null); }}
                                className="px-3 py-1.5 text-xs text-gray-500 border border-white/10 rounded-lg hover:text-white transition-all">Clear</button>
                            <button onClick={analyse} disabled={!transcript.trim()}
                                className="flex-1 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg disabled:opacity-30 hover:shadow-glow transition-all">
                                🚀 Full Analyse
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Results (3 cols) ────────────────────────── */}
                <div className="xl:col-span-3 flex flex-col gap-4">

                    {/* Per-minute timeline */}
                    {minuteLogs.length > 0 && (
                        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">📈 Per-Minute Clarity Score</p>
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={minuteLogs}>
                                    <XAxis dataKey="minute" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={m => `Min ${m}`} />
                                    <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                    <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                                        formatter={(v, n) => [`${v}/100`, 'Score']} />
                                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {minuteLogs.map(m => (
                                    <div key={m.minute} className={`flex-1 min-w-[80px] p-2 rounded-xl border text-center ${scoreBg(m.score)}`}>
                                        <p className="text-[10px] text-gray-500">Min {m.minute}</p>
                                        <p className={`text-sm font-black ${scoreColor(m.score)}`}>{m.score}</p>
                                        <p className="text-[10px] text-gray-600">{m.wpm} wpm</p>
                                        {m.voiceCount > 0 && <p className="text-[9px] text-red-400">{m.voiceCount}× uhm</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result ? (
                        <>
                            {/* Score ring + grade */}
                            <div className="bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-5">
                                <div className="flex items-center gap-6">
                                    <ScoreRing score={result.overall} size={110} label="/100" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-4xl font-black text-white">{result.grade}</span>
                                            <div className="text-sm text-gray-400">
                                                <p>Overall: <strong className="text-white">{result.overall}/100</strong></p>
                                                <p>{result.readability.wc} words · {result.readability.sentences} sentences</p>
                                            </div>
                                        </div>
                                        {/* Strengths */}
                                        {result.strengths.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {result.strengths.map(s => (
                                                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">✓ {s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Radar chart */}
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">📊 8 Dimensions</p>
                                <div className="flex gap-4">
                                    <ResponsiveContainer width="50%" height={200}>
                                        <RadarChart data={result.radar}>
                                            <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                            <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} />
                                            <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                                            <Tooltip contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                    <div className="flex-1 grid grid-cols-2 gap-1.5 content-start">
                                        {result.radar.map(r => {
                                            const pct = r.score;
                                            const color = pct >= 75 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#ef4444';
                                            return (
                                                <div key={r.name} className="bg-white/[0.03] rounded-xl p-2 border border-white/5">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[10px] text-gray-500">{r.name}</span>
                                                        <span className="text-xs font-black" style={{ color }}>{r.score}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${r.score}%`, background: color }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* STAR + Filler + Power side by side */}
                            <div className="grid grid-cols-3 gap-3">
                                {/* STAR */}
                                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">STAR</p>
                                    {Object.entries(result.starCheck).map(([k, v]) => (
                                        <div key={k} className={`flex items-center gap-2 mb-1.5 text-xs ${v ? 'text-emerald-400' : 'text-gray-600'}`}>
                                            <span>{v ? '✅' : '⬜'}</span>
                                            <span className="capitalize font-semibold">{k}</span>
                                        </div>
                                    ))}
                                    <div className="mt-2 pt-2 border-t border-white/5 text-xs text-gray-400">
                                        {result.starFilled}/4 detected
                                    </div>
                                </div>

                                {/* Fillers */}
                                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Fillers</p>
                                    {result.fillers.length === 0 ? (
                                        <p className="text-emerald-400 text-xs">🎉 None!</p>
                                    ) : (
                                        result.fillers.slice(0, 6).map(f => (
                                            <div key={f.word} className={`flex justify-between items-center mb-1 text-xs ${f.category === 'vocal' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                <span className="font-mono">"{f.word}"</span>
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded font-bold">×{f.count}</span>
                                            </div>
                                        ))
                                    )}
                                    {result.voiceCount > 0 && (
                                        <p className="text-[10px] text-red-300/70 mt-2 border-t border-white/5 pt-2">
                                            ⚠️ {result.voiceCount} vocal sounds
                                        </p>
                                    )}
                                </div>

                                {/* Power words */}
                                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Power</p>
                                    {result.foundPower.length === 0 ? (
                                        <p className="text-gray-600 text-xs">None found<br /><span className="text-indigo-400">Use action verbs!</span></p>
                                    ) : (
                                        result.foundPower.slice(0, 6).map(w => (
                                            <span key={w} className="inline-block text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 mr-1 mb-1 font-semibold">{w}</span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Improvements */}
                            {result.improvements.length > 0 && (
                                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">💡 Improvements</p>
                                    {result.improvements.map((tip, i) => (
                                        <div key={i} className="flex gap-3 items-start mb-2 text-xs text-gray-400">
                                            <span className="text-indigo-400 font-bold flex-shrink-0">{i + 1}.</span> {tip}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Annotated transcript */}
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">🔍 Annotated Transcript</p>
                                <p className="text-xs leading-loose font-mono text-gray-300">
                                    {transcript.split(/\b/).map((word, i) => {
                                        const lower = word.toLowerCase().trim();
                                        const isFiller = ALL_FILLERS.includes(lower);
                                        const isVocal = FILLERS_HEAVY.includes(lower);
                                        const isPower = POWER_WORDS.includes(lower);
                                        return (
                                            <span key={i} className={
                                                isVocal ? 'bg-red-500/25 text-red-300 rounded px-0.5 font-bold' :
                                                    isFiller ? 'bg-yellow-500/20 text-yellow-300 rounded px-0.5' :
                                                        isPower ? 'bg-emerald-500/20 text-emerald-300 rounded px-0.5 font-semibold' : ''
                                            }>{word}</span>
                                        );
                                    })}
                                </p>
                                <div className="flex gap-4 mt-3 text-[10px] text-gray-600">
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500/40 rounded inline-block" /> Vocal filler (uhm/um)</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500/40 rounded inline-block" /> Verbal filler</span>
                                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500/40 rounded inline-block" /> Power word</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/20 border border-white/5 rounded-2xl min-h-[400px]">
                            <div className="text-5xl mb-4">🎙️</div>
                            <p className="text-gray-500 text-sm text-center">
                                Record your answer or type one<br />
                                <span className="text-indigo-400">Per-minute scores appear while recording</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
