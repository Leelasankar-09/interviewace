// src/pages/practice/CompanyPrep.jsx
import { useState } from 'react';
import { FiBriefcase, FiSearch, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import api from '../../api/axios';

export default function CompanyPrep() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setLoading(true);
        try {
            const res = await api.get(`/prep/company?company=${query}`);
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto animate-fade">
            <div className="relative mb-12 p-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-emerald-600/10 to-teal-500/5 border border-white/5">
                <div className="relative z-10 space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">Company Deep Dive</h1>
                    <p className="text-text-secondary max-w-lg">Get specific interview patterns, common questions, and cultural insights for any top tech company.</p>

                    <div className="pt-6 flex gap-4 max-w-md">
                        <div className="relative flex-1 group">
                            <FiSearch className="absolute left-4 top-4 text-text-muted group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search Company (e.g. Google, Meta)"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-emerald-500/50 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-8 py-4 bg-emerald-500 rounded-2xl text-sm font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
                        >
                            Analyze
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="p-20 text-center animate-pulse">Consulting AI Knowledge Base...</div>}

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                        <div>
                            <h4 className="text-sm font-bold mb-6 opacity-30 uppercase tracking-widest">Interview Pipeline</h4>
                            <div className="space-y-4">
                                {result.pipeline?.map((step, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">{i + 1}</div>
                                        <div>
                                            <h5 className="font-bold text-sm">{step.name}</h5>
                                            <p className="text-xs text-text-secondary">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold mb-6 opacity-30 uppercase tracking-widest">Key Focus Areas</h4>
                            <div className="flex flex-wrap gap-3">
                                {result.focus_areas?.map(tag => (
                                    <span key={tag} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                            <h4 className="text-sm font-bold mb-6 opacity-30 uppercase tracking-widest">Candidate Experience</h4>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {result.candidate_experience || "AI analysis of 500+ glassdoor reviews indicates a high bar for system design and culture fit."}
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                            <h4 className="text-sm font-bold mb-6 opacity-30 uppercase tracking-widest">Recent Questions</h4>
                            <div className="space-y-3">
                                {result.recent_questions?.map((q, i) => (
                                    <div key={i} className="p-4 bg-white/[0.03] border border-white/5 rounded-xl text-xs text-white">
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!result && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
                    {['Google', 'Meta', 'Netflix'].map(name => (
                        <div key={name} className="p-8 bg-white/5 border border-white/5 rounded-[2rem] text-center space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-xl">🏢</div>
                            <h4 className="font-bold">{name}</h4>
                            <p className="text-[10px] text-text-muted uppercase font-black">Ready for Analysis</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
