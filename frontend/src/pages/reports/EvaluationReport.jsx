// src/pages/reports/EvaluationReport.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowLeft, FiDownload, FiShare2, FiCheckCircle,
    FiActivity, FiTarget, FiZap, FiBarChart2,
    FiClock, FiAlertCircle, FiAward
} from 'react-icons/fi';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function EvaluationReport() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/evaluation/${id}`);
                setData(res.data);
            } catch (err) {
                toast.error("Failed to load evaluation.");
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id]);

    if (loading) return <div className="p-20 text-center animate-pulse">Analyzing results...</div>;
    if (!data) return <div className="text-center py-20 font-serif text-text-muted">Report not found.</div>;

    const radarData = [
        { name: 'STAR', score: data.score_star_structure * 10 || 0 },
        { name: 'Clarity', score: data.score_clarity * 10 || 0 },
        { name: 'Tone', score: data.score_tone_confidence * 10 || 0 },
        { name: 'Depth', score: data.score_depth * 10 || 0 },
        { name: 'Impact', score: data.score_impact_results * 10 || 0 },
        { name: 'Specifics', score: data.score_specificity * 10 || 0 },
    ];

    return (
        <div className="max-w-[1200px] mx-auto animate-fade pb-20">
            {/* Nav */}
            <div className="flex justify-between items-center mb-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-text-muted hover:text-white transition-colors group"
                >
                    <FiArrowLeft className="group-hover:-translate-x-1" /> Back to History
                </button>
                <div className="flex gap-4">
                    <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"><FiDownload /></button>
                    <button className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"><FiShare2 /></button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600/20 to-indigo-500/5 border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
                    <div className="relative z-10 w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="86" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                            <motion.circle
                                initial={{ strokeDashoffset: 540 }}
                                animate={{ strokeDashoffset: 540 * (1 - (data.score_overall || 0) / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="96" cy="96" r="86" fill="none" stroke="#6366f1" strokeWidth="12"
                                strokeDasharray="540" strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold">{data.score_overall || 0}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Total Score</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 relative z-10">
                        <div className="inline-flex gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <FiAward /> Success Index: High
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight">AI Evaluation Report</h2>
                        <p className="text-text-secondary leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 py-2">
                            "{data.ai_feedback}"
                        </p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col justify-center space-y-6">
                    <StatRow icon={<FiTarget />} label="STAR Met" value={`${data.score_star_structure}/10`} />
                    <StatRow icon={<FiZap />} label="Impact" value={`${data.score_impact_results}/10`} />
                    <StatRow icon={<FiActivity />} label="Tone" value={`${data.score_tone_confidence}/10`} />
                    <StatRow icon={<FiCheckCircle />} label="Status" value="PROCESSED" />
                </div>
            </div>

            {/* Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white/5 border border-white/5 rounded-[3rem] p-10 h-[450px]">
                    <h3 className="text-xl font-bold mb-8">Performance Spectrum</h3>
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="80%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#ec4899"
                                    fill="#ec4899"
                                    fillOpacity={0.4}
                                />
                                <Tooltip contentStyle={{ background: '#16161f', border: 'none', borderRadius: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ScoreBox label="Grammar" value={data.score_grammar} />
                    <ScoreBox label="Vocabulary" value={data.score_vocabulary} />
                    <ScoreBox label="Relevance" value={data.score_relevance} />
                    <ScoreBox label="Authenticity" value={data.score_authenticity} />
                    <ScoreBox label="Conciseness" value={data.score_conciseness} />
                    <ScoreBox label="Confidence" value={data.score_tone_confidence} />
                </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[3rem] p-10">
                    <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                        <FiCheckCircle /> Key Strengths
                    </h3>
                    <ul className="space-y-4">
                        {data.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl text-text-secondary text-sm">
                                <span className="text-emerald-400 font-bold shrink-0">{i + 1}.</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-pink-500/10 border border-pink-500/20 rounded-[3rem] p-10">
                    <h3 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-2">
                        <FiZap /> Optimization Areas
                    </h3>
                    <ul className="space-y-4">
                        {data.improvements?.map((s, i) => (
                            <li key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl text-text-secondary text-sm">
                                <span className="text-pink-400 font-bold shrink-0">{i + 1}.</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function StatRow({ icon, label, value }) {
    return (
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-3 text-text-muted">
                {icon}
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <span className="font-bold text-white">{value}</span>
        </div>
    );
}

function ScoreBox({ label, value }) {
    const scoreVal = value || 0;
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between group hover:border-indigo-500/30 transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">{label}</span>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold tracking-tight">{scoreVal}</span>
                <span className="text-[10px] font-bold text-indigo-400">/ 10</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scoreVal * 10}%` }}
                    className="h-full bg-indigo-500"
                />
            </div>
        </div>
    );
}
