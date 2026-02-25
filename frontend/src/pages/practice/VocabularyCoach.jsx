// src/pages/practice/VocabularyCoach.jsx
import { useState } from 'react';
import { FiBook, FiCpu, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import api from '../../api/axios';

const POWER_WORDS = [
    { word: 'Orchestrated', usage: 'Lead and control a complex situation.', category: 'Leadership' },
    { word: 'Spearheaded', usage: 'Lead an initiative or movement.', category: 'Initiative' },
    { word: 'Optimized', usage: 'Make something as effective as possible.', category: 'Technical' },
    { word: 'Mitigated', usage: 'Reduced the severity of a risk.', category: 'Problem Solving' },
];

export default function VocabularyCoach() {
    return (
        <div className="max-w-6xl mx-auto animate-fade">
            <div className="mb-12 space-y-4">
                <h2 className="text-4xl font-bold">Vocabulary Coach</h2>
                <p className="text-text-secondary">AI-powered suggestions to elevate your interview language from basic to expert.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10">
                        <h4 className="text-sm font-bold mb-6 opacity-50 uppercase tracking-widest">Sentence Tuner</h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted">Basic Sentence</label>
                                <textarea
                                    placeholder="I was in charge of a project that made the app faster..."
                                    className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-lg outline-none focus:border-indigo-500/50 transition-all resize-none"
                                />
                            </div>
                            <button className="btn btn-primary w-full py-4 rounded-xl text-sm font-bold shadow-glow">
                                Enhance with AI <FiCpu className="ml-2" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10">
                        <h4 className="text-sm font-bold mb-6 opacity-50 uppercase tracking-widest">Power Word Bank</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {POWER_WORDS.map(item => (
                                <div key={item.word} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-lg text-indigo-400">{item.word}</h5>
                                        <span className="px-2 py-0.5 bg-indigo-500/10 rounded text-[8px] font-black uppercase text-indigo-400">{item.category}</span>
                                    </div>
                                    <p className="text-xs text-text-secondary">{item.usage}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 rounded-3xl p-8">
                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-6">Impact Analysis</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-text-secondary">Precision</span>
                                <span className="text-xs font-bold">85%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-indigo-500" />
                            </div>
                            <p className="text-[10px] text-text-muted leading-relaxed">
                                Using stronger verbs like "Orchestrated" instead of "Managed" increases perceived leadership level by 24%.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
