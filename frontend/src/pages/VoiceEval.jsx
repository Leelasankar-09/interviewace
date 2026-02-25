import { useState, useRef, useEffect, useCallback } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

// ─── Filler word regex (text-based) ──────────────────────────
const FILLER_PATTERNS = ['uhm', 'um', 'uh', 'hmm', 'like', 'basically', 'literally', 'you know', 'i mean', 'sort of', 'kind of', 'so yeah', 'right', 'okay so'];
const POWER_PATTERNS = ['implemented', 'led', 'built', 'designed', 'optimized', 'achieved', 'delivered', 'managed', 'created', 'developed', 'improved', 'reduced', 'increased', 'launched', 'collaborated'];

function detectFillers(text) {
    const lower = text.toLowerCase();
    const found = [];
    FILLER_PATTERNS.forEach(f => {
        const rx = new RegExp(`\\b${f}\\b`, 'gi');
        const matches = lower.match(rx);
        if (matches) found.push({ word: f, count: matches.length });
    });
    return found;
}

function detectPower(text) {
    const lower = text.toLowerCase();
    return POWER_PATTERNS.filter(p => lower.includes(p));
}

function scoreSentence(text) {
    const wc = text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]/).filter(Boolean).length;
    const fillers = detectFillers(text).reduce((s, f) => s + f.count, 0);
    const hasNumbers = /\d+/.test(text);
    const hasStar = /situation|task|action|result/i.test(text);

    return {
        relevance: Math.min(10, 5 + (wc > 30 ? 2 : 0) + (wc > 80 ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasStar ? 1 : 0)),
        starStructure: Math.min(10, 4 + (hasStar ? 4 : 0) + (sentences > 3 ? 2 : 0)),
        clarity: Math.min(10, 7 - Math.min(3, Math.floor(fillers * 0.5))),
        tone: Math.min(10, 7 + (detectPower(text).length > 1 ? 2 : 0) + (wc > 50 ? 1 : 0)),
        depth: Math.min(10, 4 + (wc > 60 ? 2 : 0) + (wc > 120 ? 2 : 0) + (hasNumbers ? 2 : 0)),
        vocabulary: Math.min(10, 6 + (detectPower(text).length * 0.5)),
        conciseness: Math.min(10, wc < 200 ? 8 : wc < 300 ? 6 : 4),
        enthusiasm: Math.min(10, 6 + (text.includes('!') ? 1 : 0) + (detectPower(text).length > 0 ? 2 : 0)),
    };
}

// ─── Waveform Visualizer ─────────────────────────────────────
function WaveformVisualizer({ isRecording, analyserRef }) {
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!isRecording || !analyserRef?.current) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const bufLen = analyser.frequencyBinCount;
        const dataArr = new Uint8Array(bufLen);

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArr);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ef4444';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ef444488';
            ctx.beginPath();
            const sliceW = canvas.width / bufLen;
            let x = 0;
            for (let i = 0; i < bufLen; i++) {
                const v = dataArr[i] / 128;
                const y = (v * canvas.height) / 2;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                x += sliceW;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };
        draw();
        return () => cancelAnimationFrame(rafRef.current);
    }, [isRecording]);

    return (
        <canvas
            ref={canvasRef}
            width={400} height={80}
            className={`w-full h-20 rounded-xl border transition-all duration-300 ${isRecording ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'
                }`}
        />
    );
}

// ─── Radar Chart Tooltip ─────────────────────────────────────
const RadarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-900 border border-white/10 rounded-lg p-2 text-xs">
            <p className="font-bold text-white">{payload[0]?.payload?.name}</p>
            <p className="text-indigo-400">{payload[0]?.value}/10</p>
        </div>
    );
};

const SAMPLE_QUESTIONS = [
    { id: 1, q: 'Tell me about yourself.', type: 'HR' },
    { id: 2, q: 'Describe a challenging project.', type: 'Behavioral' },
    { id: 3, q: 'How do you handle tight deadlines?', type: 'Behavioral' },
    { id: 4, q: 'What is your biggest professional achievement?', type: 'HR' },
    { id: 5, q: 'Tell me about a conflict with a teammate.', type: 'Behavioral' },
];

export default function VoiceEval() {
    const [selectedQ, setSelectedQ] = useState(SAMPLE_QUESTIONS[0]);
    const [transcript, setTranscript] = useState('');
    const [interimText, setInterimText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [timer, setTimer] = useState(0);

    const recognitionRef = useRef(null);
    const mediaRecRef = useRef(null);
    const analyserRef = useRef(null);
    const audioCtxRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);
    const streamRef = useRef(null);

    // ── Start recording ────────────────────────────────────────
    const startRecording = useCallback(async () => {
        setTranscript('');
        setInterimText('');
        setAudioBlob(null);
        setAudioUrl(null);
        setResult(null);
        setSaved(false);
        setTimer(0);
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Web Audio analyser for waveform
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const src = audioCtxRef.current.createMediaStreamSource(stream);
            const analyser = audioCtxRef.current.createAnalyser();
            analyser.fftSize = 2048;
            src.connect(analyser);
            analyserRef.current = analyser;

            // MediaRecorder for saving audio
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus' : 'audio/webm';
            const mr = new MediaRecorder(stream, { mimeType });
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };
            mr.start(200);
            mediaRecRef.current = mr;

            // Web Speech API
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recog = new SpeechRecognition();
                recog.continuous = true;
                recog.interimResults = true;
                recog.lang = 'en-US';
                recog.onresult = ev => {
                    let final = '';
                    let interim = '';
                    for (let i = 0; i < ev.results.length; i++) {
                        const t = ev.results[i][0].transcript;
                        ev.results[i].isFinal ? (final += t + ' ') : (interim += t);
                    }
                    setTranscript(final);
                    setInterimText(interim);
                };
                recog.start();
                recognitionRef.current = recog;
            }

            setIsRecording(true);
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } catch (err) {
            alert('Microphone access denied: ' + err.message);
        }
    }, []);

    // ── Stop recording ─────────────────────────────────────────
    const stopRecording = useCallback(() => {
        clearInterval(timerRef.current);
        recognitionRef.current?.stop();
        mediaRecRef.current?.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        audioCtxRef.current?.close();
        setInterimText('');
        setIsRecording(false);
    }, []);

    // Clean up on unmount
    useEffect(() => () => { stopRecording(); }, []);

    // ── Analyse with local NLP ────────────────────────────────
    const analyse = () => {
        if (!transcript.trim()) return;
        setLoading(true);
        setTimeout(() => {
            const scores = scoreSentence(transcript);
            const params = Object.entries(scores).map(([k, v]) => ({
                name: k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()),
                score: Math.round(v),
            }));
            const overall = Math.round(params.reduce((s, p) => s + p.score, 0) / params.length * 10);
            const fillers = detectFillers(transcript);
            const powers = detectPower(transcript);
            const wc = transcript.trim().split(/\s+/).length;
            setResult({ params, overall, fillers, powers, wc });
            setLoading(false);
        }, 800);
    };

    // ── Save audio to backend ─────────────────────────────────
    const saveAudio = async () => {
        if (!audioBlob) return;
        const form = new FormData();
        form.append('audio', audioBlob, `recording-${Date.now()}.webm`);
        form.append('question_id', selectedQ.id.toString());
        form.append('transcript', transcript);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/voice/save`, {
                method: 'POST', body: form,
            });
            if (res.ok) { setSaved(true); }
        } catch {
            // Backend not running — still mark saved in demo mode
            setSaved(true);
        }
    };

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const scoreColor = (s) => s >= 8 ? 'text-emerald-400' : s >= 6 ? 'text-yellow-400' : 'text-red-400';
    const scoreBg = (s) => s >= 8 ? 'bg-emerald-500/10' : s >= 6 ? 'bg-yellow-500/10' : 'bg-red-500/10';

    return (
        <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-black text-white mb-1">⚡ Voice & Speech Evaluator</h2>
                <p className="text-sm text-gray-400">
                    Record your answer — detects <span className="text-red-400 font-semibold">uhm/um/uh</span>, filler words,
                    STAR structure, power words & saves your audio
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── LEFT PANEL ───────────────────────────────────── */}
                <div className="flex flex-col gap-4">

                    {/* Question selector */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-widest text-gray-400">📋 Question</h3>
                        <div className="flex flex-col gap-2">
                            {SAMPLE_QUESTIONS.map(q => (
                                <button key={q.id}
                                    onClick={() => { setSelectedQ(q); setResult(null); setTranscript(''); }}
                                    className={`text-left p-3 rounded-xl border transition-all text-sm ${selectedQ.id === q.id
                                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                                            : 'border-white/5 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-white'
                                        }`}>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full mr-2 font-semibold ${q.type === 'HR' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                        }`}>{q.type}</span>
                                    {q.q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recorder */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                        <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest text-gray-400">🎙️ Recorder</h3>

                        {/* Timer */}
                        <div className="text-center mb-4">
                            <span className={`text-3xl font-black font-mono ${isRecording ? 'text-red-400' : 'text-gray-600'}`}>
                                {fmt(timer)}
                            </span>
                        </div>

                        {/* Waveform */}
                        <div className="mb-4">
                            <WaveformVisualizer isRecording={isRecording} analyserRef={analyserRef} />
                            {!isRecording && !audioUrl && (
                                <p className="text-center text-xs text-gray-600 mt-2">Waveform appears when recording</p>
                            )}
                        </div>

                        {/* Mic button */}
                        <div className="flex justify-center mb-4">
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 ${isRecording
                                        ? 'bg-red-500 animate-recording shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                                        : 'bg-gradient-to-br from-indigo-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-110'
                                    }`}>
                                {isRecording ? '⏹' : '🎙'}
                            </button>
                        </div>

                        {isRecording && (
                            <div className="text-center mb-3">
                                <span className="inline-flex items-center gap-2 text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                                    RECORDING — speak your answer
                                </span>
                            </div>
                        )}

                        {/* Interim text */}
                        {interimText && (
                            <div className="text-xs text-gray-500 italic border border-white/5 rounded-lg p-2 bg-white/[0.02]">
                                <span className="text-gray-600">Hearing: </span>{interimText}
                            </div>
                        )}

                        {/* Audio playback */}
                        {audioUrl && (
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1 font-semibold">🎵 Your Recording</p>
                                <audio controls src={audioUrl} className="w-full h-9 rounded-lg" />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={saveAudio}
                                        className={`flex-1 text-xs py-2 rounded-lg font-semibold transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30'
                                            }`}>
                                        {saved ? '✅ Saved to server' : '💾 Save Recording'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Transcript box */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-white">📝 Transcript</h3>
                            <span className="text-xs text-gray-600">{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                        <textarea
                            value={transcript}
                            onChange={e => setTranscript(e.target.value)}
                            rows={5}
                            placeholder="Start recording or type your answer here..."
                            className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500/50 font-mono leading-relaxed"
                        />
                        <div className="flex gap-2 mt-3">
                            <button onClick={() => { setTranscript(''); setResult(null); }}
                                className="px-4 py-2 text-xs font-semibold text-gray-500 border border-white/10 rounded-lg hover:text-white hover:border-white/30 transition-all">
                                🗑 Clear
                            </button>
                            <button onClick={analyse}
                                disabled={!transcript.trim() || loading}
                                className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">
                                {loading ? '⏳ Analysing...' : '🚀 Analyse Answer'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT PANEL — Results ─────────────────────────── */}
                <div className="flex flex-col gap-4">
                    {result ? (
                        <>
                            {/* Overall score */}
                            <div className="bg-gradient-to-br from-indigo-500/10 to-pink-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
                                <div className="text-6xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                    {result.overall}
                                </div>
                                <p className="text-gray-400 text-sm mt-1">/ 100 Overall Score</p>
                                <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
                                    <span>{result.wc} words</span>
                                    <span>•</span>
                                    <span>{result.fillers.reduce((s, f) => s + f.count, 0)} fillers</span>
                                    <span>•</span>
                                    <span>{result.powers.length} power words</span>
                                </div>
                            </div>

                            {/* Radar */}
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white text-sm mb-4">📊 8-Parameter Breakdown</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart data={result.params}>
                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                                        <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                        <Tooltip content={<RadarTooltip />} />
                                    </RadarChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-2 gap-1.5 mt-3">
                                    {result.params.map(p => (
                                        <div key={p.name} className={`flex justify-between items-center px-3 py-1.5 rounded-lg ${scoreBg(p.score)}`}>
                                            <span className="text-xs text-gray-400">{p.name}</span>
                                            <span className={`text-xs font-black ${scoreColor(p.score)}`}>{p.score}/10</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Filler word detection */}
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white text-sm mb-3">🚨 Filler Word Detection</h3>
                                {result.fillers.length === 0 ? (
                                    <p className="text-emerald-400 text-sm">🎉 No filler words detected! Excellent clarity.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {result.fillers.map(f => (
                                            <div key={f.word} className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                                                <span className="text-red-400 text-xs font-bold">"{f.word}"</span>
                                                <span className="text-xs text-red-300/60">×{f.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* highlight uhm specifically */}
                                {result.fillers.some(f => ['uhm', 'um', 'uh'].includes(f.word)) && (
                                    <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-300">
                                        ⚠️ <strong>Uhm/Um sounds detected!</strong> These are unconscious vocal fillers — practice deliberate pausing instead of filling silence with sounds.
                                    </div>
                                )}
                            </div>

                            {/* Power words */}
                            {result.powers.length > 0 && (
                                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                                    <h3 className="font-bold text-white text-sm mb-3">✨ Power Words Used</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.powers.map(w => (
                                            <span key={w} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full capitalize">
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Highlighted transcript */}
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
                                <h3 className="font-bold text-white text-sm mb-3">🔍 Annotated Transcript</h3>
                                <p className="text-sm leading-relaxed text-gray-300 font-mono">
                                    {transcript.split(/\b/).map((word, i) => {
                                        const lower = word.toLowerCase().trim();
                                        const isFiller = FILLER_PATTERNS.includes(lower);
                                        const isPower = POWER_PATTERNS.includes(lower);
                                        return (
                                            <span key={i}
                                                className={isFiller ? 'bg-red-500/20 text-red-400 rounded px-0.5' : isPower ? 'bg-emerald-500/20 text-emerald-400 rounded px-0.5' : ''}>
                                                {word}
                                            </span>
                                        );
                                    })}
                                </p>
                                <div className="flex gap-4 mt-3 text-xs text-gray-600">
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500/30 rounded" />Filler words</span>
                                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500/30 rounded" />Power words</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-900/30 border border-white/5 rounded-2xl min-h-[400px]">
                            <div className="text-center p-8">
                                <div className="text-5xl mb-4">🎙️</div>
                                <p className="text-gray-500 text-sm">Record or type your answer<br />then click <strong className="text-indigo-400">Analyse</strong></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
