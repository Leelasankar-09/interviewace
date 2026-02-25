// src/pages/practice/SystemDesign.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiLayers, FiChevronLeft, FiSend, FiLayout, FiDatabase,
    FiServer, FiCpu, FiTrendingUp, FiArrowRight
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const TOPICS = [
    { id: 'url-shortener', title: 'URL Shortener', difficulty: 'Medium', icon: <FiLayers />, companies: ['Google', 'Meta'] },
    { id: 'rate-limiter', title: 'Rate Limiter', difficulty: 'Medium', icon: <FiServer />, companies: ['Uber', 'Stripe'] },
    { id: 'instagram', title: 'Instagram Feed', difficulty: 'Hard', icon: <FiLayout />, companies: ['Meta', 'Googl'] },
    { id: 'uber', title: 'Uber Backend', difficulty: 'Hard', icon: <FiTrendingUp />, companies: ['Uber', 'Lyft'] },
    { id: 'youtube', title: 'YouTube Architecture', difficulty: 'Hard', icon: <FiDatabase />, companies: ['Google', 'Netflix'] },
    { id: 'search', title: 'Autocomplete Search', difficulty: 'Medium', icon: <FiCpu />, companies: ['Google', 'LinkedIn'] },
];

export default function SystemDesign() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);
    const [answer, setAnswer] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [filter, setFilter] = useState('All');

    const handleEvaluate = async () => {
        if (answer.trim().length < 50) {
            toast.warn("Please provide more detail for evaluation");
            return;
        }

        setIsEvaluating(true);
        try {
            const res = await api.post('/evaluation/submit', {
                question: selected.title,
                answer: answer,
                type: 'system-design'
            });
            toast.success("Design Evaluated!");
            navigate(`/evaluation/${res.data.id}`);
        } catch (error) {
            toast.error("Evaluation failed");
        } finally {
            setIsEvaluating(false);
        }
    };

    const filtered = filter === 'All' ? TOPICS : TOPICS.filter(t => t.difficulty === filter);

    if (selected) return (
        <div className="max-w-6xl mx-auto animate-fade">
            <div className="flex items-center gap-4 mb-10 overflow-hidden">
                <button
                    onClick={() => setSelected(null)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-text-muted transition-all"
                >
                    <FiChevronLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">{selected.title}</h2>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{selected.difficulty} DESIGN CHALLENGE</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10">
                        <h4 className="text-sm font-bold mb-4 opacity-50">Problem Requirements</h4>
                        <p className="text-lg text-white leading-relaxed mb-10">
                            Design a highly available and scalable {selected.title}. Focus on horizontal scaling, consistency vs availability tradeoffs, and choose appropriate storage solutions.
                        </p>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest ml-1">Your Proposed Architecture</label>
                            <textarea
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                placeholder="Describe your components (LB, Cache, DB), API design, and scaling strategy..."
                                className="w-full h-96 bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-lg focus:border-indigo-500/50 outline-none transition-all resize-none"
                            />
                        </div>

                        <button
                            onClick={handleEvaluate}
                            disabled={isEvaluating}
                            className="w-full btn btn-primary py-5 rounded-2xl mt-10 text-lg group"
                        >
                            {isEvaluating ? <div className="spinner mr-2" /> : <FiSend className="mr-2" />}
                            {isEvaluating ? 'AI is Architecting...' : 'Submit for System Review'}
                            <FiArrowRight className="ml-2 group-hover:translate-x-1" />
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 rounded-3xl p-8">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">Review Parameters</h4>
                        <div className="space-y-4">
                            <ParameterItem label="Scalability" />
                            <ParameterItem label="High Availability" />
                            <ParameterItem label="Data Consistency" />
                            <ParameterItem label="Latency Control" />
                            <ParameterItem label="Security" />
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                        <h4 className="text-xs font-black uppercase tracking-widest text-text-muted mb-4">Companies</h4>
                        <div className="flex flex-wrap gap-2">
                            {selected.companies.map(c => (
                                <span key={c} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-text-secondary">{c}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto animate-fade">
            <div className="mb-12 space-y-4">
                <h2 className="text-4xl font-bold">System Design Arena</h2>
                <p className="text-text-secondary">Architect large-scale solutions and get rigorous AI feedback on tradeoffs.</p>

                <div className="flex gap-2 pt-4">
                    {['All', 'Medium', 'Hard'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-indigo-500 text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setSelected(t)}
                        className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] text-left hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl text-text-muted group-hover:text-indigo-400 transition-colors mb-6">
                            {t.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                        <div className="flex items-center justify-between mt-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${t.difficulty === 'Hard' ? 'text-pink-400' : 'text-amber-400'}`}>
                                {t.difficulty}
                            </span>
                            <div className="flex -space-x-2">
                                {[1, 2].map(i => <div key={i} className="w-5 h-5 rounded-full border-2 border-bg-card bg-indigo-500" />)}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ParameterItem({ label }) {
    return (
        <div className="flex items-center gap-3">
            <FiCheckCircle className="text-emerald-500" size={14} />
            <span className="text-xs text-text-secondary font-medium">{label}</span>
        </div>
    );
}
