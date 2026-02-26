import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiSquare, FiRefreshCw, FiArrowRight, FiCheckCircle, FiActivity, FiZap, FiTarget, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../../store/authStore';
import * as evalApi from '../../api/evaluation';

const SAMPLE_QUESTIONS = [
    { id: 'v1', text: 'Tell me about a time you had to handle a high-pressure situation. What was the outcome?', type: 'Behavioral' },
    { id: 'v2', text: 'How do you handle disagreements with technical decisions in your team?', type: 'Behavioral' },
    { id: 'v3', text: 'Describe your most significant technical achievement and why it matters.', type: 'Technical' },
    { id: 'v4', text: 'Explain the concept of Big O notation to a non-technical stakeholder.', type: 'Technical' },
];

export default function VoiceEval() {
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
    const [status, setStatus] = useState('idle'); // idle, counting, recording, processing
    const [timer, setTimer] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [interim, setInterim] = useState('');
    const [count, setCount] = useState(3);
    const [evaluation, setEvaluation] = useState(null);

    const mediaRecorder = useRef(null);
    const chunks = useRef([]);
    const recognition = useRef(null);
    const timerInterval = useRef(null);
    const stream = useRef(null);
    const canvasRef = useRef(null);
    const rafRef = useRef(null);
    const analyser = useRef(null);
    const audioContext = useRef(null);

    useEffect(() => {
        if (status !== 'recording' || !analyser.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);

        const draw = () => {
            rafRef.current = requestAnimationFrame(draw);
            analyser.current.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#6366f1';
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

    const startCountdown = () => {
        setStatus('counting');
        let c = 3;
        setCount(3);
        const inv = setInterval(() => {
            c -= 1;
            if (c === 0) {
                clearInterval(inv);
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
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.current.createMediaStreamSource(s);
            analyser.current = audioContext.current.createAnalyser();
            analyser.current.fftSize = 256;
            source.connect(analyser.current);

            mediaRecorder.current = new MediaRecorder(s);
            mediaRecorder.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.current.push(e.data);
            };
            mediaRecorder.current.start();

            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRec) {
                recognition.current = new SpeechRec();
                recognition.current.continuous = true;
                recognition.current.interimResults = true;
                recognition.current.onresult = (e) => {
                    let finalArr = [];
                    let interimStr = '';
                    for (let i = e.resultIndex; i < e.results.length; i++) {
                        if (e.results[i].isFinal) finalArr.push(e.results[i][0].transcript);
                        else interimStr += e.results[i][0].transcript;
                    }
                    setTranscript(prev => prev + finalArr.join(' '));
                    setInterim(interimStr);
                };
                recognition.current.start();
            }

            setStatus('recording');
            timerInterval.current = setInterval(() => setTimer(t => t + 1), 1000);
        } catch (err) {
            toast.error("Microphone access denied.");
            setStatus('idle');
        }
    };

    const stopRecording = () => {
        mediaRecorder.current?.stop();
        recognition.current?.stop();
        stream.current?.getTracks().forEach(t => t.stop());
        audioContext.current?.close();
        clearInterval(timerInterval.current);
        setStatus('processing');
        handleSubmit();
    };

    const handleSubmit = async () => {
        setTimeout(async () => {
            const audioBlob = new Blob(chunks.current, { type: 'audio/webm' });
            const formData = new FormData();
            formData.append('audio', audioBlob, 'interview.webm');
            formData.append('question_text', question.text);
            formData.append('question_type', question.type);
            formData.append('transcript', transcript);
            formData.append('duration_secs', timer);

            try {
                const res = await evalApi.submitVoiceAnswer(formData);
                setEvaluation(res.data.evaluation);
                toast.success("AI Analysis Complete");
                setStatus('done');
            } catch (err) {
                toast.error("Evaluation failed.");
                setStatus('idle');
            }
        }, 1500);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="max-w-[1000px] mx-auto min-h-[80vh] flex flex-col items-center justify-center space-y-12">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center space-y-10"
                    >
                        <div className="space-y-6">
                            <span className="badge-role uppercase tracking-[0.2em] font-black text-[10px] px-6 py-2">Simulation Lab</span>
                            <h2 className="text-5xl font-bold text-white tracking-tight max-w-2xl leading-tight">
                                "{question.text}"
                            </h2>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={startCountdown}
                                className="btn-primary h-16 px-12 rounded-2xl text-lg font-bold shadow-2xl shadow-indigo-500/20 group"
                            >
                                <FiMic className="text-xl group-hover:scale-125 transition-transform" /> Commence Practice
                            </button>
                            <button
                                onClick={() => setQuestion(SAMPLE_QUESTIONS[Math.floor(Math.random() * SAMPLE_QUESTIONS.length)])}
                                className="btn-secondary h-16 px-8 rounded-2xl text-lg"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-6 pt-10">
                            <GuideCard icon={<FiZap />} title="12-PT NLP" desc="Real-time fillery & tone" />
                            <GuideCard icon={<FiAward />} title="Benchmarking" desc="Target role matching" />
                            <GuideCard icon={<FiTarget />} title="STAR Focus" desc="Logic structure review" />
                        </div>
                    </motion.div>
                )}

                {status === 'counting' && (
                    <motion.div key="counting" className="text-center">
                        <motion.span
                            initial={{ scale: 0.5 }} animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}
                            className="text-[12rem] font-black text-indigo-500 block leading-none"
                        >
                            {count}
                        </motion.span>
                    </motion.div>
                )}

                {status === 'recording' && (
                    <motion.div key="recording" className="w-full max-w-3xl space-y-10">
                        <div className="text-center space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                <motion.div animate={{ opacity: [1, 0, 1] }} className="w-2 h-2 bg-rose-500 rounded-full" />
                                <span className="text-[10px] font-black tracking-[0.3em] text-rose-500 uppercase">System Listening</span>
                            </div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{formatTime(timer)}</h3>
                        </div>

                        <div className="glass p-12 rounded-[3.5rem] border border-white/10 space-y-10">
                            <canvas ref={canvasRef} className="w-full h-32 opacity-50" width={1000} height={150} />

                            <div className="p-8 rounded-3xl bg-white/5 border border-white/5 min-h-[120px]">
                                <p className="text-lg text-white/40 leading-relaxed italic">
                                    {transcript} <span className="text-indigo-400 font-bold opacity-100 italic">{interim}</span>
                                </p>
                            </div>

                            <button
                                onClick={stopRecording}
                                className="w-full h-16 bg-white text-black rounded-2xl font-bold text-lg hover:bg-white/90 transition-all flex items-center justify-center gap-3"
                            >
                                <FiSquare size={20} /> Collect response & Terminate
                            </button>
                        </div>
                    </motion.div>
                )}

                {status === 'processing' && (
                    <motion.div key="processing" className="text-center space-y-6">
                        <div className="w-20 h-20 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                        <h3 className="title-section text-white">Synthesizing Feedback</h3>
                        <p className="text-white/30 font-medium">Claude 3.5 is running 12-parameter cross-analysis...</p>
                    </motion.div>
                )}

                {status === 'done' && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-4xl space-y-10"
                    >
                        <div className="glass p-16 rounded-[4rem] text-center border border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-indigo-400">
                                <FiAward size={48} />
                            </div>
                            <h2 className="text-5xl font-bold text-white mb-4">Mastery Achieved.</h2>
                            <p className="text-xl text-white/40 font-medium mb-12">Your interview simulation has been successfully veted.</p>

                            <div className="flex justify-center gap-16 mb-12">
                                <div className="text-center">
                                    <h4 className="text-7xl font-black text-indigo-400">{Math.round(evaluation?.overall_score || 0)}</h4>
                                    <p className="text-[10px] uppercase font-black tracking-[0.25em] text-white/30 mt-2">Overall Mastery</p>
                                </div>
                                <div className="w-px bg-white/10 h-20" />
                                <div className="text-center">
                                    <h4 className="text-7xl font-black text-white">A-</h4>
                                    <p className="text-[10px] uppercase font-black tracking-[0.25em] text-white/30 mt-2">AI Grading</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button onClick={() => setStatus('idle')} className="btn-secondary h-14 px-8 rounded-xl font-bold">New Attempt</button>
                                <button className="btn-primary h-14 px-12 rounded-xl font-bold flex items-center gap-3">
                                    Detailed PDF Report <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function GuideCard({ icon, title, desc }) {
    return (
        <div className="glass p-6 rounded-[2rem] border border-white/5 text-left group hover:border-indigo-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{title}</h4>
            <p className="text-[10px] font-medium text-white/30 leading-relaxed">{desc}</p>
        </div>
    );
}
