import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight, FiClock, FiTrendingUp, FiStar, FiTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

const roles = [
    {
        id: 'swe',
        title: 'Software Engineer',
        emoji: '💻',
        demand: 'Critical',
        salary: '₹12L - ₹45L',
        timeline: '12 weeks',
        color: '#6366f1',
        skills: ['DSA', 'System Design', 'Core CS'],
        gradient: 'from-indigo-600/20 to-indigo-600/5'
    },
    {
        id: 'frontend',
        title: 'Frontend Engineer',
        emoji: '🎨',
        demand: 'Ultra High',
        salary: '₹8L - ₹35L',
        timeline: '10 weeks',
        color: '#ec4899',
        skills: ['React', 'TypeScript', 'Layout'],
        gradient: 'from-pink-600/20 to-pink-600/5'
    },
    {
        id: 'ml',
        title: 'ML Engineer',
        emoji: '🤖',
        demand: 'Hyper High',
        salary: '₹15L - ₹65L',
        timeline: '16 weeks',
        color: '#10b981',
        skills: ['RAG', 'PyTorch', 'Linear Algebra'],
        gradient: 'from-emerald-600/20 to-emerald-600/5'
    },
    {
        id: 'devops',
        title: 'DevOps Architect',
        emoji: '⚙️',
        demand: 'Essential',
        salary: '₹10L - ₹40L',
        timeline: '14 weeks',
        color: '#f59e0b',
        skills: ['Kubernetes', 'CI/CD', 'Cloud'],
        gradient: 'from-amber-600/20 to-amber-600/5'
    },
    {
        id: 'data',
        title: 'Data Scientist',
        emoji: '📊',
        demand: 'Strategic',
        salary: '₹10L - ₹45L',
        timeline: '14 weeks',
        color: '#3b82f6',
        skills: ['Statistics', 'Pandas', 'Modeling'],
        gradient: 'from-blue-600/20 to-blue-600/5'
    },
    {
        id: 'pm',
        title: 'Product Leader',
        emoji: '🚀',
        demand: 'Executive',
        salary: '₹18L - ₹70L',
        timeline: '12 weeks',
        color: '#a855f7',
        skills: ['Strategy', 'Execution', 'Metrics'],
        gradient: 'from-purple-600/20 to-purple-600/5'
    }
];

export default function Roles() {
    const navigate = useNavigate();

    return (
        <div className="max-w-[1200px] mx-auto pb-20 selection:bg-indigo-500/30">
            <header className="mb-16">
                <h1 className="title-page text-white mb-2">Carrier Blueprints.</h1>
                <p className="text-xl text-white/40 font-medium tracking-tight">Structured intelligence paths for elite engineering roles.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {roles.map((role, idx) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => navigate(`/roles/${role.id}`)}
                        className={`glass p-10 rounded-[3rem] border border-white/10 cursor-pointer group hover:border-white/30 transition-all relative overflow-hidden`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                    {role.emoji}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                    {role.demand} Priority
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{role.title}</h3>
                            <div className="flex gap-4 mb-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                <span className="flex items-center gap-1.5"><FiTrendingUp /> {role.salary}</span>
                                <span className="flex items-center gap-1.5"><FiClock /> {role.timeline}</span>
                            </div>

                            <div className="space-y-4 mb-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Core Competencies</p>
                                <div className="flex flex-wrap gap-2">
                                    {role.skills.map(s => (
                                        <span key={s} className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-bold text-white/60">{s}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                Access Blueprint <FiChevronRight />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
