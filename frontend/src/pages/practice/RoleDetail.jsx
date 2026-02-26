import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiBook, FiTerminal, FiLayers, FiActivity, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const rolesData = {
    swe: {
        title: 'Software Engineer', emoji: '💻', color: '#6366f1',
        salary: '₹12L - ₹45L', timeline: '12 weeks', demand: 'Critical',
        mustHave: ['Data Structures & Algorithms', 'OOP Principles', 'System Design Basics', 'SQL & Databases', 'Git', 'Python/Java/C++'],
        goodToHave: ['Cloud (AWS/GCP)', 'Docker & K8s', 'CI/CD', 'Redis', 'GraphQL'],
        advanced: ['Distributed Systems', 'Microservices', 'Message Queues', 'Performance Tuning'],
        roadmap: [
            { week: 'Week 1-2', title: 'Logic Foundation', desc: 'Arrays, Strings, LinkedLists, Stacks, Queues. Solve 30 easy LeetCode.' },
            { week: 'Week 3-4', title: 'Complex Structures', desc: 'Binary trees, BFS/DFS, Tries. Solve 20 medium LeetCode problems.' },
            { week: 'Week 5-6', title: 'DP Mastery', desc: 'Dynamic Programming, Heaps, Sliding Window. Target: 10 medium DP.' },
            { week: 'Week 7-8', title: 'System Architecture', desc: 'Load balancers, Databases, Caching, CAP theorem, Design Twitter/Uber.' },
        ],
        questions: {
            'Technical 1': ['Two Sum variations', 'Merge intervals', 'LRU Cache implementation', 'Binary search edge cases'],
            'System Design': ['Design URL Shortener', 'Design Instagram', 'Design Rate Limiter', 'Design Notification System'],
        }
    },
    frontend: {
        title: 'Frontend Engineer', emoji: '🎨', color: '#ec4899',
        salary: '₹8L - ₹35L', timeline: '10 weeks', demand: 'Hyper',
        mustHave: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js', 'REST APIs', 'Responsive Design', 'Git'],
        goodToHave: ['TypeScript', 'Next.js', 'Redux/Zustand', 'CSS Frameworks', 'Web Perf'],
        advanced: ['Micro-Frontends', 'WebAssembly', 'PWA', 'WebSockets'],
        roadmap: [
            { week: 'Week 1-2', title: 'JS Core Engine', desc: 'Closures, Promises, Async/Await, Event Loop, Prototypes.' },
            { week: 'Week 3-4', title: 'React Internalism', desc: 'Hooks, Context, Custom hooks, React Query, Performance.' },
        ],
        questions: {
            'Base Round': ['Explain event loop', 'Closure examples', 'Promise vs async/await', 'Virtual DOM'],
        }
    }
};

export default function RoleDetail() {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const role = rolesData[roleId] || rolesData.swe;
    const [tab, setTab] = useState('skills');

    return (
        <div className="max-w-[1200px] mx-auto pb-20 selection:bg-indigo-500/30">
            {/* Apple Back Navigation */}
            <button
                onClick={() => navigate('/roles')}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-10 font-black uppercase tracking-widest text-[10px]"
            >
                <FiArrowLeft /> Back to Blueprints
            </button>

            {/* Spec Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16">
                <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-5xl glass border border-white/10 shadow-2xl">
                        {role.emoji}
                    </div>
                    <div>
                        <h1 className="title-page text-white mb-2">{role.title}</h1>
                        <div className="flex gap-4">
                            <span className="badge-role">{role.demand} Priority</span>
                            <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em] mt-1.5">{role.salary} / {role.timeline}</span>
                        </div>
                    </div>
                </div>
                <button className="btn-primary h-14 px-10 rounded-2xl font-bold flex items-center gap-3">
                    Activate Training Path <FiArrowRight />
                </button>
            </div>

            {/* Spec Navigation */}
            <div className="flex gap-10 border-b border-white/5 mb-12">
                {['skills', 'roadmap', 'questions'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`h-16 text-[10px] font-black uppercase tracking-[0.25em] relative transition-all ${tab === t ? 'text-indigo-400' : 'text-white/20 hover:text-white'
                            }`}
                    >
                        {t}
                        {tab === t && <motion.div layoutId="detailTab" className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400" />}
                    </button>
                ))}
            </div>

            {/* Content Layers */}
            <AnimatePresence mode="wait">
                {tab === 'skills' && (
                    <motion.div
                        key="skills"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <SkillSection title="Core Requirements" icon={<FiTerminal />} items={role.mustHave} color="text-rose-400" bg="bg-rose-500/5" border="border-rose-500/10" />
                        <SkillSection title="Secondary Mastery" icon={<FiLayers />} items={role.goodToHave} color="text-amber-400" bg="bg-amber-500/5" border="border-amber-500/10" />
                        <SkillSection title="Senior Synthesis" icon={<FiActivity />} items={role.advanced} color="text-emerald-400" bg="bg-emerald-500/5" border="border-emerald-500/10" />
                    </motion.div>
                )}

                {tab === 'roadmap' && (
                    <motion.div
                        key="roadmap"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="space-y-6 max-w-4xl"
                    >
                        {role.roadmap.map((step, i) => (
                            <div key={i} className="flex gap-8 group">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center font-black text-[10px] text-white/40">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 w-px bg-white/10 my-2" />
                                </div>
                                <div className="glass p-10 rounded-[3rem] border border-white/10 flex-1 mb-6 group-hover:border-indigo-500/30 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">{step.week}</span>
                                    </div>
                                    <p className="text-white/40 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {tab === 'questions' && (
                    <motion.div
                        key="questions"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {Object.entries(role.questions).map(([round, qs]) => (
                            <div key={round} className="glass p-10 rounded-[3rem] border border-white/10 space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">{round}</h3>
                                <div className="space-y-4">
                                    {qs.map((q, i) => (
                                        <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <FiBook className="shrink-0 mt-1 text-white/20" />
                                            <p className="text-sm font-medium text-white/60">{q}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SkillSection({ title, items, icon, color, bg, border }) {
    return (
        <div className={`glass p-10 rounded-[3.5rem] border ${border} ${bg} space-y-8`}>
            <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl ${color}`}>
                {icon}
            </div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">{title}</h3>
            <div className="space-y-4">
                {items.map(s => (
                    <div key={s} className="flex items-center gap-3 text-sm font-medium text-white/40">
                        <FiCheckCircle className={color} /> {s}
                    </div>
                ))}
            </div>
        </div>
    );
}
