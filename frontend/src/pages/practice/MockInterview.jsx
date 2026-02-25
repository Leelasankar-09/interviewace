// src/pages/practice/MockInterview.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiPlay, FiSquare, FiSend, FiUser, FiCpu,
    FiSettings, FiArrowRight, FiCheckCircle, FiClock, FiActivity
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const ROLES = ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack', 'Data Scientist', 'Product Manager'];
const ROUNDS = ['Technical', 'Behavioral', 'System Design', 'HR'];

export default function MockInterview() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [phase, setPhase] = useState('setup'); // setup | interview | summary
    const [role, setRole] = useState(ROLES[0]);
    const [roundType, setRoundType] = useState(ROUNDS[0]);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startInterview = async () => {
        setPhase('interview');
        const initialMsg = {
            role: 'assistant',
            content: `Hello! I'm your AI interviewer today. We'll be conducting a ${roundType} interview for the ${role} position. Ready? Let's start with: Tell me about a challenging project you've worked on recently.`
        };
        setMessages([initialMsg]);
    };

    const sendMessage = async () => {
        if (!input.trim() || isStreaming) return;
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsStreaming(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/mock/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${useAuthStore.getState().token}`
                },
                body: JSON.stringify({
                    message: input,
                    history: messages,
                    role: role,
                    round_type: roundType
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                aiText += decoder.decode(value);
                setMessages(prev => {
                    const next = [...prev];
                    next[next.length - 1].content = aiText;
                    return next;
                });
            }
        } catch (err) {
            toast.error("Chat connection failed");
        } finally {
            setIsStreaming(false);
        }
    };

    if (phase === 'setup') return (
        <div className="max-w-3xl mx-auto animate-fade py-12">
            <div className="bg-white/5 border border-white/5 rounded-[3rem] p-12 text-center space-y-10">
                <div className="space-y-4">
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto text-3xl text-indigo-400">
                        <FiCpu />
                    </div>
                    <h2 className="text-4xl font-bold">AI Mock Interview</h2>
                    <p className="text-text-secondary max-w-md mx-auto">Practice with a dynamic AI interviewer that adapts to your responses and asks follow-up questions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Target Role</label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none appearance-none"
                        >
                            {ROLES.map(r => <option key={r} value={r} className="bg-bg-card">{r}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-2">Round Type</label>
                        <select
                            value={roundType}
                            onChange={e => setRoundType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none appearance-none"
                        >
                            {ROUNDS.map(r => <option key={r} value={r} className="bg-bg-card">{r}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    onClick={startInterview}
                    className="w-full btn btn-primary py-5 rounded-2xl text-lg font-bold shadow-glow group"
                >
                    Initialize Simulation <FiPlay className="ml-2 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade flex flex-col h-[calc(100vh-140px)]">
            {/* Nav */}
            <div className="flex justify-between items-center mb-6 px-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <FiCpu />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">AI Interviewer</h3>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">{roundType} • {role}</p>
                    </div>
                </div>
                <button
                    onClick={() => setPhase('setup')}
                    className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 rounded-xl text-xs font-bold transition-all"
                >
                    Terminate Session
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar pb-10">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white/5 border border-white/5 text-text-secondary rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isStreaming && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-bg-card">
                <div className="relative group">
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder="Type your response... (Enter to send)"
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 pr-20 text-sm focus:border-indigo-500/50 outline-none transition-all resize-none h-24"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isStreaming || !input.trim()}
                        className="absolute right-4 bottom-4 w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <FiSend size={20} />
                    </button>
                </div>
                <p className="text-[10px] text-text-muted text-center mt-4 uppercase tracking-widest font-black opacity-40">
                    Proprietary AI Engine v2.4 • Low Latency Streaming Enabled
                </p>
            </div>
        </div>
    );
}
