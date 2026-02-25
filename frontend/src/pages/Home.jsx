// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiZap, FiCpu } from 'react-icons/fi';

export default function Home() {
    return (
        <div className="min-h-screen bg-bg-primary text-white overflow-hidden">
            {/* Nav */}
            <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">InterviewAce</span>
                <div className="flex gap-8 items-center">
                    <Link to="/login" className="text-sm font-bold text-text-muted hover:text-white transition-colors">Login</Link>
                    <Link to="/signup" className="btn btn-primary px-6 py-2 rounded-xl text-sm font-bold">Join Waitlist</Link>
                </div>
            </nav>

            {/* Hero */}
            <header className="max-w-7xl mx-auto px-8 pt-20 pb-32 text-center relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-text-muted mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Just Launched: AI Mock Suite v2.0
                </div>

                <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                    Master the <span className="text-indigo-500">Interview</span>,<br />
                    Secure the <span className="text-pink-500">Offer.</span>
                </h1>

                <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
                    The only full-stack preparation platform powered by advanced AI.
                    From DSA to System Design, we train you to think like an engineer at top tech companies.
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <Link to="/signup" className="btn btn-primary px-10 py-5 rounded-2xl text-lg font-bold shadow-glow group">
                        Start Training Free <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/community" className="px-10 py-5 rounded-2xl text-lg font-bold bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                        Explore Community
                    </Link>
                </div>
            </header>

            {/* Features Preview */}
            <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
                <FeatureCard
                    icon={<FiCpu />}
                    title="AI Realism"
                    desc="Claude-powered interviewers that ask adaptive follow-up questions dynamic to your response."
                />
                <FeatureCard
                    icon={<FiZap />}
                    title="Instant Analysis"
                    desc="Receive detailed 12-parameter evaluation reports within seconds of finishing your practice."
                />
                <FeatureCard
                    icon={<FiShield />}
                    title="ATS Optimized"
                    desc="Built-in parser ensures your resume passes the bot and reaches the hiring manager."
                />
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-10 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-4 hover:border-indigo-500/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
        </div>
    );
}
