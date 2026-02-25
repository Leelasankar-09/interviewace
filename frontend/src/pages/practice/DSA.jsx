// src/pages/practice/DSA.jsx
import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { FiPlay, FiCheck, FiX, FiClock, FiAward, FiCode, FiCpu, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
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
                if (res.data.length > 0) {
                    selectProblem(res.data[0]);
                }
            } catch (error) {
                toast.error("Failed to load problems");
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    const selectProblem = (p) => {
        setSelP(p);
        // Ensure p.initial_code is handled
        const starter = p.initial_code?.javascript || `function solution() {\n  // Your code here\n}`;
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
            toast.success("AI Review Complete");
        } catch (error) {
            toast.error("Code evaluation failed");
        } finally {
            setRunning(false);
        }
    }, [code, selP]);

    const filtered = diffFilter === 'All' ? problems : problems.filter(p => p.difficulty === diffFilter);

    if (loading) return <div className="p-12 text-center text-text-muted">Loading Problem Bank...</div>;

    return (
        <div className="max-w-[1400px] mx-auto animate-fade">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Problem Sidebar */}
                <div className="w-full md:w-[320px] shrink-0 space-y-4">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FiBookOpen className="text-indigo-400" /> Problems
                        </h3>
                        <div className="flex gap-2 mb-4">
                            {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDiffFilter(d)}
                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${diffFilter === d ? 'bg-indigo-500 text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {filtered.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => selectProblem(p)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selP?.id === p.id
                                            ? 'bg-indigo-500/10 border-indigo-500/30'
                                            : 'bg-transparent border-transparent hover:bg-white/5'
                                        }`}
                                >
                                    <p className="text-sm font-bold mb-1">{p.title}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: DIFF_COLOR[p.difficulty] }}>
                                            {p.difficulty}
                                        </span>
                                        <span className="text-[10px] text-text-muted">{p.topic}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor Section */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col h-[750px]">
                        {/* Tabs */}
                        <div className="flex items-center justify-between px-8 bg-white/5 border-b border-white/5">
                            <div className="flex">
                                {['description', 'results', 'ai review'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTab(t)}
                                        className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-text-muted hover:text-text-secondary'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleRun}
                                    disabled={running}
                                    className="btn btn-primary px-6 py-2 rounded-xl text-xs gap-2"
                                >
                                    {running ? <div className="spinner" /> : <FiPlay />}
                                    {running ? 'Reviewing...' : 'Submit & Review'}
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {/* Panel Top: Info */}
                            {tab === 'description' && (
                                <div className="p-10 overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                                    <div className="flex items-center gap-3 mb-6">
                                        <h1 className="text-3xl font-bold">{selP?.title}</h1>
                                        <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest" style={{ color: DIFF_COLOR[selP?.difficulty] }}>
                                            {selP?.difficulty}
                                        </span>
                                    </div>
                                    <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                                        {selP?.description}
                                    </div>
                                    {selP?.sample_input && (
                                        <div className="mt-8 space-y-4">
                                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Sample Input</p>
                                                <code className="text-indigo-300 font-mono">{selP.sample_input}</code>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Sample Output</p>
                                                <code className="text-emerald-300 font-mono">{selP.sample_output}</code>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'results' && (
                                <div className="p-10 flex flex-col items-center justify-center text-center h-full space-y-4">
                                    {!aiReview ? (
                                        <>
                                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-3xl text-text-muted mb-4">
                                                <FiZap />
                                            </div>
                                            <h3 className="text-xl font-bold">Ready to test?</h3>
                                            <p className="text-text-secondary max-w-xs mx-auto text-sm">Submit your solution for a deep AI code review and complexity analysis.</p>
                                        </>
                                    ) : (
                                        <div className="w-full text-left space-y-8">
                                            <div className="grid grid-cols-2 gap-4">
                                                <StatBox icon={<FiCheck />} label="Correctness" value={`${aiReview.correctness * 10}%`} />
                                                <StatBox icon={<FiClock />} label="Time Complexity" value={aiReview.time_complexity} />
                                                <StatBox icon={<FiCpu />} label="Space Complexity" value={aiReview.space_complexity} />
                                                <StatBox icon={<FiAward />} label="Score" value={aiReview.correctness >= 8 ? 'A' : 'B'} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'ai review' && (
                                <div className="p-10 overflow-y-auto custom-scrollbar">
                                    {!aiReview ? (
                                        <div className="h-full flex items-center justify-center text-text-muted italic">Submit code to see AI insights</div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                    <FiAlertTriangle className="text-amber-500" /> Detected Issues
                                                </h4>
                                                <ul className="space-y-3">
                                                    {aiReview.bugs?.map((bug, i) => (
                                                        <li key={i} className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{bug}</li>
                                                    ))}
                                                    {aiReview.bugs?.length === 0 && <p className="text-text-muted italic text-sm">No critical bugs found. Clean work!</p>}
                                                </ul>
                                            </div>

                                            <div>
                                                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                    <FiCode className="text-emerald-500" /> Optimized Solution
                                                </h4>
                                                <div className="bg-slate-900 rounded-2xl p-6 border border-white/5 font-mono text-sm overflow-x-auto text-emerald-400 whitespace-pre">
                                                    {aiReview.optimized_solution}
                                                </div>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                                <h4 className="font-bold mb-2">AI Explanation</h4>
                                                <p className="text-sm text-text-secondary leading-relaxed">{aiReview.explanation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Monaco Editor - Always at bottom */}
                            <div className="border-t border-white/5 h-[400px]">
                                <Editor
                                    height="100%"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={code}
                                    onChange={(v) => setCode(v)}
                                    options={{
                                        fontSize: 14,
                                        fontFamily: "'JetBrains Mono', monospace",
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 20 },
                                        backgroundColor: 'transparent'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value }) {
    return (
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className="text-2xl text-indigo-400">{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
        </div>
    );
}
