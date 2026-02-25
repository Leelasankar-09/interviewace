// src/pages/practice/Behavioral.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiMic, FiSquare, FiSend, FiRotateCcw, FiLayers, FiCheckCircle,
    FiHelpCircle, FiClock, FiActivity, FiArrowRight
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const BEHAVIORAL_QUESTIONS = [
    { id: 1, category: 'Leadership', question: 'Tell me about a time you led a team through a difficult project.' },
    { id: 2, category: 'Conflict', question: 'Describe a situation where you had a disagreement with a coworker.' },
    { id: 3, category: 'Failure', question: 'Tell me about your biggest professional failure and what you learned.' },
    { id: 4, category: 'Achievement', question: 'What is the most significant project you have delivered?' },
    { id: 5, category: 'Adaptability', question: 'Tell me about a time you had to adapt quickly to a major change.' }
];

export default function Behavioral() {
    const navigate = useNavigate();
    const [selQ, setSelQ] = useState(BEHAVIORAL_QUESTIONS[0]);
    const [mode, setMode] = useState('text'); // 'text' or 'voice'
    const [answer, setAnswer] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isEvaluating, setIsEvaluating] = useState(false);

    // Recognition ref
    const recognitionRef = useRef(null);

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Browser does not support Speech Recognition");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setAnswer(prev => prev + ' ' + transcript);
        };

        recognitionRef.current.onerror = (err) => {
            console.error("Speech Error", err);
            setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);
        toast.info("Recording started. Speak now.");
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleEvaluate = async () => {
        if (answer.trim().length < 20) {
            toast.warn("Answer too short for evaluation");
            return;
        }

        setIsEvaluating(true);
        try {
            const res = await api.post('/evaluation/submit', {
                question: selQ.question,
                answer: answer,
                type: 'behavioral'
            });
            toast.success("Evaluation complete!");
            navigate(`/evaluation/${res.data.id}`);
        } catch (error) {
            toast.error("Evaluation failed. Please try again.");
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Question List Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <FiLayers className="text-indigo-400" /> Topic Bank
                        </h3>
                        <div className="space-y-2">
                            {BEHAVIORAL_QUESTIONS.map(q => (
                                <button
                                    key={q.id}
                                    onClick={() => { setSelQ(q); setAnswer(''); }}
                                    className={`w-full text-left p-4 rounded-2xl transition-all border ${selQ.id === q.id
                                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100'
                                            : 'bg-transparent border-transparent text-text-muted hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest block mb-1">{q.category}</span>
                                    <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600/20 to-pink-500/10 border border-white/5 rounded-[2rem] p-8">
                        <h4 className="font-bold flex items-center gap-2 mb-4">
                            <FiActivity className="text-indigo-400" /> Readiness Tip
                        </h4>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Use the <span className="text-white font-bold">STAR</span> method. Focus on the <span className="text-indigo-400">Action</span> you took and the measurable <span className="text-pink-400">Result</span>.
                        </p>
                    </div>
                </div>

                {/* Interaction Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 md:p-12">
                        <div className="mb-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                Active Challenge
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                                {selQ.question}
                            </h2>
                        </div>

                        {/* Mode Switch */}
                        <div className="flex bg-white/5 p-1 rounded-2xl w-fit mb-8">
                            <button
                                onClick={() => setMode('text')}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'text' ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
                            >
                                Text Mode
                            </button>
                            <button
                                onClick={() => setMode('voice')}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'voice' ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-secondary'}`}
                            >
                                Voice Mode
                            </button>
                        </div>

                        {/* Workspace */}
                        <div className="relative mb-8">
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder={mode === 'voice' ? "Click record and start speaking..." : "Type your STAR answer here..."}
                                className="w-full h-80 bg-white/5 border border-white/5 rounded-3xl p-8 focus:outline-none focus:border-indigo-500/50 text-lg leading-relaxed resize-none transition-all placeholder:text-text-muted/30"
                            />

                            <div className="absolute bottom-6 right-6 flex items-center gap-4">
                                {mode === 'voice' && (
                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording
                                                ? 'bg-red-500 animate-pulse text-white'
                                                : 'bg-white/10 text-text-secondary hover:bg-white/20'
                                            }`}
                                    >
                                        {isRecording ? <FiSquare size={20} /> : <FiMic size={24} />}
                                    </button>
                                )}
                                <button
                                    onClick={() => setAnswer('')}
                                    className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 text-text-muted flex items-center justify-center transition-all"
                                >
                                    <FiRotateCcw size={20} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleEvaluate}
                            disabled={isEvaluating}
                            className="w-full btn btn-primary py-5 rounded-2xl text-lg group"
                        >
                            {isEvaluating ? <div className="spinner mr-2" /> : <FiSend className="mr-2" />}
                            {isEvaluating ? 'AI is analyzing...' : 'Submit for AI Evaluation'}
                            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between px-8 text-text-muted text-xs">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1"><FiCheckCircle className="text-emerald-500" /> 12-Parameter Analysis</span>
                            <span className="flex items-center gap-1"><FiCheckCircle className="text-emerald-500" /> STAR Feedback</span>
                        </div>
                        <span className="font-mono text-indigo-400/60 uppercase tracking-tighter">Engine: Claude 3.5 Sonnet</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
