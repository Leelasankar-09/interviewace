import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiZap, FiCpu, FiMessageCircle, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Home() {
    return (
        <div className="min-h-screen selection:bg-indigo-500/30">
            {/* Apple Menubar Style Navigation */}
            <nav className="fixed top-0 w-full z-50 h-16 glass-morphism border-b border-white/10 px-10 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                        A
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">InterviewAce</span>
                </div>
                <div className="flex gap-8 items-center">
                    <Link to="/login" className="text-sm font-semibold text-white/50 hover:text-white transition-all">Sign In</Link>
                    <Link to="/signup" className="btn btn-primary px-8 py-2.5 rounded-full text-sm font-bold">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-40 pb-32 max-w-[1200px] mx-auto px-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                    className="text-center relative"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-10 stagger-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> AI-First Intelligence
                    </div>

                    <h1 className="title-hero text-white mb-8">
                        Think like an <span className="bg-gradient-to-b from-indigo-300 to-indigo-500 bg-clip-text text-transparent">Engineer</span>.<br />
                        Interview like a <span className="bg-gradient-to-b from-purple-300 to-purple-500 bg-clip-text text-transparent">Pro</span>.
                    </h1>

                    <p className="text-2xl text-white/50 max-w-3xl mx-auto mb-16 font-medium leading-relaxed stagger-2">
                        The definitive full-stack platform for technical mastery.
                        Simulate top-tier interviews with advanced AI v3.5.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center stagger-3">
                        <Link to="/signup" className="btn-primary px-12 py-5 rounded-2xl text-xl font-bold shadow-2xl group relative overflow-hidden">
                            Start Training Free
                            <motion.div
                                className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                            />
                        </Link>
                        <Link to="/community" className="btn-secondary px-12 py-5 rounded-2xl text-xl font-bold bg-white/5 border border-white/10 text-white backdrop-blur-xl hover:bg-white/10">
                            Explore Community
                        </Link>
                    </div>
                </motion.div>

                {/* Grid Preview */}
                <section className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<FiCpu />}
                        title="Adaptive AI"
                        desc="Claude-powered logic that evolves based on your depth of understanding."
                        gradient="from-blue-500 to-indigo-600"
                    />
                    <FeatureCard
                        icon={<FiTrendingUp />}
                        title="Deep Metrics"
                        desc="Professional 12-parameter analytics tracking your interview readiness."
                        gradient="from-purple-500 to-pink-600"
                    />
                    <FeatureCard
                        icon={<FiShield />}
                        title="ATS Scoring"
                        desc="The same parser used by recruiters to ensure your resume passes the bot."
                        gradient="from-teal-400 to-emerald-600"
                    />
                </section>
            </main>

            {/* Premium Stat Reveal */}
            <section className="py-32 glass-morphism border-y border-white/5 mt-20">
                <div className="max-w-7xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <StatItem label="Questions" value="2k+" />
                    <StatItem label="Candidates" value="15k+" />
                    <StatItem label="Success Rate" value="94%" />
                    <StatItem label="AI Evaluations" value="500k+" />
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc, gradient }) {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="p-10 glass border border-white/10 rounded-[2.5rem] group relative overflow-hidden"
        >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl text-white mb-8 shadow-xl shadow-indigo-500/20`}>
                {icon}
            </div>
            <h3 className="title-card text-white mb-4">{title}</h3>
            <p className="text-white/40 leading-relaxed font-medium">{desc}</p>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </motion.div>
    );
}

function StatItem({ value, label }) {
    return (
        <div className="space-y-2">
            <h4 className="text-5xl font-black text-white tracking-tight">{value}</h4>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-white/30">{label}</p>
        </div>
    );
}
