// src/pages/resume/ResumeATS.jsx
import { useState, useEffect } from 'react';
import {
    FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiDownload,
    FiSearch, FiTrendingUp, FiZap, FiTrash2, FiClock
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeATS() {
    const [file, setFile] = useState(null);
    const [jobDesc, setJobDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/resume/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load history");
        }
    };

    const handleFile = (f) => { if (f) { setFile(f); setResult(null); } };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('job_description', jobDesc);

            const res = await api.post('/resume/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(res.data);
            fetchHistory();
            toast.success("Analysis complete!");
        } catch (error) {
            toast.error("Failed to scan resume. Check file format.");
        } finally {
            setLoading(false);
        }
    };

    const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-rose-400';

    return (
        <div className="max-w-[1400px] mx-auto animate-fade pb-20">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left: Uploader & Inputs */}
                <div className="w-full lg:w-[450px] space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <FiUpload className="text-indigo-400" /> Resume Scanner
                        </h2>

                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                            onClick={() => document.getElementById('resume-input').click()}
                            className={`relative h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all ${dragging ? 'bg-indigo-500/10 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <input id="resume-input" type="file" accept=".pdf,.docx" hidden onChange={e => handleFile(e.target.files[0])} />
                            {file ? (
                                <div className="text-center space-y-2">
                                    <FiFile className="text-5xl text-indigo-400 mx-auto" />
                                    <p className="font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Ready to Scan</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                        <FiUpload className="text-2xl text-text-muted" />
                                    </div>
                                    <p className="text-sm font-medium text-text-secondary">Click or drop resume (PDF / DOCX)</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 space-y-4">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Target Job Description</label>
                            <textarea
                                value={jobDesc}
                                onChange={(e) => setJobDesc(e.target.value)}
                                placeholder="Paste your target job description to identify missing skill keywords..."
                                className="w-full h-48 bg-white/5 border border-white/5 rounded-2xl p-4 text-sm focus:border-indigo-500/50 outline-none transition-all resize-none"
                            />
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!file || loading}
                            className="w-full btn btn-primary py-4 rounded-xl mt-8 text-sm group"
                        >
                            {loading ? <div className="spinner mr-2" /> : <FiSearch className="mr-2" />}
                            {loading ? 'Analyzing Content...' : 'Start AI Analysis'}
                        </button>
                    </div>

                    {/* History */}
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FiClock className="text-indigo-400" /> Recent Scans
                        </h3>
                        <div className="space-y-3">
                            {history.slice(0, 5).map(h => (
                                <div key={h.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-lg ${scoreColor(h.ats_score)}`}><FiTrendingUp /></div>
                                        <div>
                                            <p className="text-xs font-bold">{h.job_description?.slice(0, 20) || 'General Scan'}...</p>
                                            <p className="text-[9px] text-text-muted uppercase">{new Date(h.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black ${scoreColor(h.ats_score)}`}>{h.ats_score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Results Display */}
                <div className="flex-1 space-y-8">
                    {!result ? (
                        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-12 h-full flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 rounded-full bg-indigo-500/5 flex items-center justify-center text-3xl text-indigo-400 mb-8">
                                <FiZap className="animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold mb-4">ATS Optimization Engine</h2>
                            <p className="text-text-secondary max-w-sm mx-auto">Upload a resume to unlock 360° AI insights, keyword matching, and section-by-section scoring.</p>
                        </div>
                    ) : (
                        <>
                            {/* Score Hero */}
                            <div className="bg-gradient-to-br from-indigo-600/20 to-pink-500/5 border border-white/5 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12">
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 452 }}
                                            animate={{ strokeDashoffset: 452 * (1 - result.ats_score / 100) }}
                                            transition={{ duration: 1.5 }}
                                            cx="80" cy="80" r="72" fill="none" stroke="#6366f1" strokeWidth="10"
                                            strokeDasharray="452" strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-bold">{result.ats_score}%</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Rank</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-text-muted text-[10px] font-black uppercase tracking-widest">
                                        AI Score Report
                                    </div>
                                    <h2 className="text-3xl font-bold">Matching Optimization</h2>
                                    <p className="text-text-secondary">Your resume has a strong foundation. We've identified <span className="text-indigo-400 font-bold">{result.keyword_gaps?.length || 0} missing keywords</span> that could boost your ATS visibility by up to 30%.</p>
                                </div>
                            </div>

                            {/* Deep Analysis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <FiAlertCircle className="text-amber-400" /> Missing Key Terms
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keyword_gaps?.map(k => (
                                            <span key={k} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-pink-400">
                                                +{k}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-400" /> AI Suggestions
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.overall_suggestions?.map((s, i) => (
                                            <li key={i} className="text-xs text-text-secondary flex gap-3 leading-relaxed">
                                                <span className="text-emerald-400 font-bold">•</span> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Section Breakdown */}
                            <div className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10">
                                <h3 className="text-xl font-bold mb-8">Section-Level Feedback</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {result.sections && Object.entries(result.sections).map(([key, val]) => (
                                        <div key={key} className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-bold capitalize">{key}</h4>
                                                <span className="text-sm font-black text-indigo-400">{val.score}/10</span>
                                            </div>
                                            <p className="text-xs text-text-muted leading-relaxed">{val.feedback}</p>
                                            {val.rewrite && (
                                                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 font-mono">
                                                    <p className="text-[10px] font-black uppercase mb-1 opacity-50">AI Optimized Rewrite</p>
                                                    {val.rewrite}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
