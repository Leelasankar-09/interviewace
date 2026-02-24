import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiSquare, FiRefreshCw, FiArrowRight, FiCheckCircle, FiAlertCircle, FiClock, FiActivity, FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { evaluateAPI } from '../api/services';

const SAMPLE_QUESTIONS = [
    { id: 'v1', text: 'Tell me about a time you had to handle a high-pressure situation. What was the outcome?', type: 'Behavioral' },
    { id: 'v2', text: 'How do you handle disagreements with technical decisions in your team?', type: 'Behavioral' },
    { id: 'v3', text: 'Describe your most significant technical achievement and Why it matters.', type: 'Technical' },
    { id: 'v4', text: 'Explain the concept of Big O notation to a non-technical stakeholder.', type: 'Technical' },
];

export default function VoiceEval() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    // State
    const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
    const [status, setStatus] = useState('idle'); // idle, counting, recording, processing
    const [timer, setTimer] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [interim, setInterim] = useState('');
    const [isCounting, setIsCounting] = useState(false);
    const [count, setCount] = useState(3);
    const [evaluation, setEvaluation] = useState(null);

    // Refs
    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const recognition = useRef(null);
    const timerInterval = useRef(null);
    const stream = useRef(null);
    const analyser = useRef(null);
    const audioContext = useRef(null);

    // ── Waveform Logic ───────────────────────────────────────────
    const canvasRef = useRef(null);
    const rafRef = useRef(null);

    useEffect(() => {
        if (status !== 'recording' || !analyser.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);
            analyser.current.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#c2410c'; // terracotta
            ctx.beginPath();
            const sliceWidth = canvas.width * 1.0 / dataArray.length;
            let x = 0;
            for (let i = 0; i < dataArray.length; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };
        draw();
        return () => cancelAnimationFrame(rafRef.current);
    }, [status]);

    // ── Actions ──────────────────────────────────────────────────
    const startCountdown = () => {
        setIsCounting(true);
        setStatus('counting');
        let c = 3;
        setCount(3);
        const inv = setInterval(() => {
            c -= 1;
            if (c === 0) {
                clearInterval(inv);
                setIsCounting(false);
                startRecording();
            } else {
                setCount(c);
            }
        }, 1000);
    };

    const startRecording = async () => {
        setTranscript('');
        setInterim('');
        setTimer(0);
        chunks.current = [];

        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.current = s;

            // Audio Context for Waveform
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.current.createMediaStreamSource(s);
            analyser.current = audioContext.current.createAnalyser();
            analyser.current.fftSize = 256;
            source.connect(analyser.current);

            // MediaRecorder
            mediaRecorder.current = new MediaRecorder(s);
            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };
            mediaRecorder.current.start();

            // Speech Recognition
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRec) {
                recognition.current = new SpeechRec();
                recognition.current.continuous = true;
                recognition.current.interimResults = true;
                recognition.current.onresult = (e) => {
                    let finalArr = [];
                    let interimStr = '';
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        if (e.results[i].isFinal) {
                            finalArr.push(e.results[i][0].transcript);
                        } else {
                            interimStr += e.results[i][0].transcript;
                        }
                    }
                    setTranscript(prev => prev + finalArr.join(' '));
                    setInterim(interimStr);
                };
                recognition.current.start();
            }

            setStatus('recording');
            timerInterval.current = setInterval(() => setTimer(t => t + 1), 1000);
        } catch (err) {
            console.error(err);
            toast.error("Microphone access denied or error occurred.");
            setStatus('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) mediaRecorder.current.stop();
        if (recognition.current) recognition.current.stop();
        if (stream.current) stream.current.getTracks().forEach(t => t.stop());
        if (audioContext.current) audioContext.current.close();
        clearInterval(timerInterval.current);
        setStatus('processing');

        // Wait for final chunks then submit
        setTimeout(() => {
            handleSubmit();
        }, 800);
    };

    const handleSubmit = async () => {
        if (chunks.current.length === 0) {
            toast.error("No audio recorded.");
            setStatus('idle');
            return;
        }

        const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'interview.webm');
        formData.append('question_text', question.text);
        formData.append('question_type', question.type);
        formData.append('transcript', transcript);
        formData.append('duration_secs', timer);
        formData.append('user_id', user?.id || '');

        try {
            const res = await evaluateAPI.voice(formData);
            if (res.data.success) {
                setEvaluation(res.data.evaluation);
                toast.success("Analysis complete!");
                setTimeout(() => {
                    navigate(`/evaluation/${res.data.session_id}`);
                }, 1500);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to process evaluation.");
        } finally {
            setStatus('done');
        }
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const nextQuestion = () => {
        const idx = SAMPLE_QUESTIONS.indexOf(question);
        setQuestion(SAMPLE_QUESTIONS[(idx + 1) % SAMPLE_QUESTIONS.length]);
        setStatus('idle');
        setEvaluation(null);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-[90vh] flex flex-col items-center">

            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full text-center space-y-10"
                    >
                        <div className="space-y-4">
                            <span className="px-4 py-1.5 bg-orange-50 text-terracotta text-xs font-bold rounded-full border border-orange-100 uppercase tracking-[0.2em]">
                                Voice Evaluation Phase
                            </span>
                            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 max-w-2xl mx-auto leading-tight">
                                "{question.text}"
                            </h2>
                            <p className="text-slate-400 text-sm font-medium">Type: {question.type}</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors px-6 py-3"
                            >
                                <FiRefreshCw /> Try Another
                            </button>
                            <button
                                onClick={startCountdown}
                                className="flex items-center gap-3 px-10 py-5 bg-terracotta text-white rounded-2xl font-bold text-lg hover:bg-terracotta-800 shadow-xl shadow-terracotta/20 transition-all hover:-translate-y-1"
                            >
                                <FiMic size={24} /> Start Interview
                            </button>
                        </div>

                        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                            {[
                                { icon: FiZap, title: "12 Parameters", desc: "Clarity, pace, tone, and technical accuracy scoring." },
                                { icon: FiActivity, title: "Real-time NLP", desc: "Detection of fillers and power words as you speak." },
                                { icon: FiClock, title: "Time Tracking", desc: "Monitor your pace relative to ideal response lengths." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-3xl border border-warm-200">
                                    <div className="w-10 h-10 bg-warm-50 rounded-xl flex items-center justify-center text-terracotta mb-4">
                                        <item.icon size={20} />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {status === 'counting' && (
                    <motion.div
                        key="counting"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64"
                    >
                        <span className="text-8xl font-serif text-terracotta animate-pulse">{count}</span>
                        <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest">Prepare to speak</p>
                    </motion.div>
                )}

                {status === 'recording' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full space-y-12"
                    >
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                                <p className="text-red-500 font-bold uppercase tracking-widest text-sm">Recording in Progress</p>
                            </div>
                            <h3 className="text-2xl font-serif text-slate-800">{question.text}</h3>
                            <div className="text-5xl font-mono text-slate-900 font-black">{formatTime(timer)}</div>
                        </div>

                        <div className="bg-white p-8 rounded-[3rem] border-2 border-warm-200 shadow-2xl space-y-8">
                            <canvas ref={canvasRef} className="w-full h-24 rounded-2xl" width={800} height={100} />

                            <div className="min-h-[120px] bg-warm-50/50 p-6 rounded-3xl border border-warm-100 flex items-center justify-center text-center">
                                {interim ? (
                                    <p className="text-slate-600 italic text-lg leading-relaxed">{transcript} <span className="text-terracotta opacity-60 font-bold">{interim}</span></p>
                                ) : (
                                    <p className="text-slate-400 text-lg">{transcript || "Start speaking, I'm listening..."}</p>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={stopRecording}
                                    className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all hover:scale-105"
                                >
                                    <FiSquare /> Finish & Evaluate
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {status === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center space-y-6 py-20"
                    >
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-warm-100 border-t-terracotta rounded-full animate-spin"></div>
                            <FiActivity className="absolute inset-0 m-auto text-terracotta animate-pulse" size={32} />
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-serif text-slate-900">AI Analysis in Progress</h3>
                            <p className="text-slate-400 mt-2">Claude 3.5 is evaluating your response against 12 parameters...</p>
                        </div>
                    </motion.div>
                )}

                {status === 'done' && evaluation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full space-y-8"
                    >
                        <div className="bg-white p-10 rounded-[3rem] border border-warm-200 shadow-lg text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                <FiCheckCircle size={48} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-serif text-slate-900">Great Job!</h2>
                                <p className="text-slate-400 font-medium">Your interview session has been analyzed.</p>
                            </div>

                            <div className="flex justify-center items-center gap-12 py-6">
                                <div className="text-center">
                                    <div className="text-6xl font-serif text-terracotta font-black mb-1">{Math.round(evaluation.overall_score)}</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Score</div>
                                </div>
                                <div className="h-16 w-px bg-warm-200"></div>
                                <div className="text-center">
                                    <div className="text-6xl font-serif text-slate-900 font-black mb-1">A-</div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Grade</div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-8 py-4 bg-warm-100 text-slate-600 rounded-2xl font-bold hover:bg-warm-200 transition-all"
                                >
                                    Practice More
                                </button>
                                <button
                                    className="px-10 py-4 bg-terracotta text-white rounded-2xl font-bold hover:bg-terracotta-800 shadow-lg shadow-terracotta/20 flex items-center justify-center gap-2 transition-all"
                                >
                                    View Full Report <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
