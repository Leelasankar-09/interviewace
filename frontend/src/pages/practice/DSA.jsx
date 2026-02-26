import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiCheck, FiX, FiClock, FiAward, FiCode, FiCpu, FiAlertTriangle, FiBookOpen, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const DIFF_COLOR = { Easy: '#10b981', Medium: '#f59e0b', Hard: '#ef4444' };

export default function DSA() {
    const [problems, setProblems] = useState([]);
    const [selP, setSelP] = useState(null);
    const [code, setCode] = useState('');
    const [results, setResults] = useState(null);
    const [running, setRunning] = useState(false);
    const [aiReview, setAiReview] = useState(null);
    const [tab, setTab] = useState('description');
    const [diffFilter, setDiffFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await api.get('/dsa/problems');
                setProblems(res.data);
                if (res.data.length > 0) selectProblem(res.data[0]);
            } catch (error) {
                toast.error("Network synchronization failed");
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const selectProblem = (p) => {
        setSelP(p);
        const starter = p.initial_code?.javascript || `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`;
        setCode(starter);
        setResults(null);
        setAiReview(null);
        setTab('description');
    };

    const handleRun = useCallback(async () => {
        setRunning(true);
        setTab('results');
        try {
            const res = await api.post('/dsa/submit', {
                problem_id: selP.id,
                code: code,
                language: 'javascript'
            });
            setAiReview(res.data);
            toast.success("AI Synthesis Complete");
        } catch (error) {
            toast.error("Execution failure");
        } finally {
            setRunning(false);
        }
    }, [code, selP]);

    const filtered = diffFilter === 'All' ? problems : problems.filter(p => p.difficulty === diffFilter);

    if (loading) return <div className="p-20 text-center text-white/20 font-black uppercase tracking-[0.5em] animate-pulse">Initializing Problem Matrix...</div>;

    return (
        <div className="max-w-[1400px] mx-auto pb-20 selection:bg-indigo-500/30">
            <div className="flex flex-col xl:flex-row gap-10">
                {/* Problem Sidebar */}
                <div className="w-full xl:w-[380px] shrink-0 space-y-6">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-8 flex items-center gap-2">
                            <FiBookOpen className="text-indigo-400" /> Objective Matrix
                        </h3>

                        <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl">
                            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDiffFilter(d)}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${diffFilter === d
                                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-white/30 hover:text-white'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {filtered.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => selectProblem(p)}
                                    className={`w-full text-left p-5 rounded-2xl border transition-all group relative overflow-hidden ${selP?.id === p.id
                                            ? 'glass !bg-white/10 border-indigo-500/50'
                                            : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: DIFF_COLOR[p.difficulty] }}>
                                            {p.difficulty}
                                        </span>
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{p.topic}</span>
                                    </div>
                                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{p.title}</p>
                                    {selP?.id === p.id && <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Coding Interface */}
                <main className="flex-1 min-w-0 space-y-6">
                    <div className="glass border border-white/10 rounded-[3rem] overflow-hidden flex flex-col h-[850px]">
                        {/* Tab Navigation */}
                        <div className="flex items-center justify-between px-10 h-20 border-b border-white/5">
                            <div className="flex gap-8">
                                {['description', 'results', 'ai review'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={`h-20 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${tab === t ? 'text-indigo-400' : 'text-white/20 hover:text-white'
                                            }`}
                                    >
                                        {t}
                                        {tab === t && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400" />}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleRun}
                                disabled={running}
                                className="btn-primary h-11 px-8 rounded-full text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                            >
                                {running ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <FiPlay />}
                                {running ? 'Executing...' : 'Submit Evaluation'}
                            </button>
                        </div>

                        {/* Content Split/Switch */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                                <AnimatePresence mode="wait">
                                    {tab === 'description' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                                            className="p-12 space-y-10"
                                        >
                                            <div className="space-y-4">
                                                <h1 className="text-4xl font-bold text-white tracking-tight">{selP?.title}</h1>
                                                <div className="flex gap-4">
                                                    <span className="badge-role">{selP?.difficulty}</span>
                                                    <span className="text-[10px] font-black uppercase text-white/20 tracking-widest p-1.5">{selP?.topic}</span>
                                                </div>
                                            </div>
                                            <div className="text-lg text-white/50 leading-relaxed font-medium whitespace-pre-wrap max-w-3xl">
                                                {selP?.description}
                                            </div>

                                            {selP?.sample_input && (
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Input Pattern</p>
                                                        <code className="text-sm text-indigo-400 font-mono block">{selP.sample_input}</code>
                                                    </div>
                                                    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                                                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Expected Output</p>
                                                        <code className="text-sm text-emerald-400 font-mono block">{selP.sample_output}</code>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {tab === 'results' && (
                                        <motion.div
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            className="h-full flex flex-col items-center justify-center p-12 text-center"
                                        >
                                            {!aiReview ? (
                                                <div className="space-y-6">
                                                    <div className="w-24 h-24 rounded-[2rem] glass flex items-center justify-center text-4xl text-white/10 mx-auto">
                                                        <FiCpu />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white">Awaiting Logic</h3>
                                                    <p className="text-white/30 max-w-xs font-medium">Inject your code into the terminal to begin the cross-platform evaluation.</p>
                                                </div>
                                            ) : (
                                                <div className="w-full max-w-3xl grid grid-cols-2 gap-6">
                                                    <MetricTile label="Logic Correctness" value={`${aiReview.correctness * 10}%`} icon={<FiCheck />} />
                                                    <MetricTile label="Temporal Complexity" value={aiReview.time_complexity} icon={<FiClock />} />
                                                    <MetricTile label="Spatial Intensity" value={aiReview.space_complexity} icon={<FiCpu />} />
                                                    <MetricTile label="AI Designation" value={aiReview.correctness >= 8 ? 'A+' : 'B'} icon={<FiAward />} />
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {tab === 'ai review' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                            className="p-12 space-y-12"
                                        >
                                            {!aiReview ? (
                                                <div className="text-center py-40 text-white/10 font-black uppercase tracking-widest">No Intelligence Data</div>
                                            ) : (
                                                <>
                                                    <div className="space-y-6">
                                                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                                            <FiAlertTriangle /> Logic Anomaly Detection
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {aiReview.bugs?.map((bug, i) => (
                                                                <div key={i} className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                                                                    {bug}
                                                                </div>
                                                            ))}
                                                            {(!aiReview.bugs || aiReview.bugs.length === 0) && (
                                                                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                                                    Zero critical anomalies detected. Logic is sound.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                                            <FiCode /> Absolute Optimization
                                                        </h4>
                                                        <div className="bg-[#050505] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
                                                            <pre className="text-emerald-400 text-xs font-mono leading-relaxed">
                                                                {aiReview.optimized_solution}
                                                            </pre>
                                                            <button className="absolute top-6 right-6 p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <FiCode className="text-white/40" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-10 rounded-[2.5rem] glass border border-white/10 bg-indigo-500/5">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Neural Overview</h4>
                                                        <p className="text-white/50 text-base leading-relaxed font-medium">{aiReview.explanation}</p>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Monaco Editor Terminal */}
                            <div className="h-[400px] border-t border-white/5 relative">
                                <div className="absolute top-4 left-10 z-10 text-[10px] font-black uppercase tracking-widest text-white/20 pointer-events-none">
                                    Production Interface / JavaScript
                                </div>
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={code}
                                    onChange={v => setCode(v)}
                                    options={{
                                        fontSize: 14,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 40, bottom: 20 },
                                        backgroundColor: 'transparent',
                                        cursorSmoothCaretAnimation: true,
                                        smoothScrolling: true,
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        scrollbar: { vertical: 'hidden' }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function MetricTile({ label, value, icon }) {
    return (
        <div className="glass p-8 rounded-[2.5rem] border border-white/10 flex items-center gap-6 text-left group hover:bg-white/10 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            </div>
        </div>
    );
}
