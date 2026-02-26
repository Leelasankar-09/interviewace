import { useState, useEffect } from 'react';
import {
    FiThumbsUp, FiMessageCircle, FiPlus, FiX, FiFilter,
    FiHash, FiUser, FiActivity, FiGlobe, FiChevronUp, FiChevronDown, FiSearch, FiTrendingUp
} from 'react-icons/fi';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function Community() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ company: '', round_type: '' });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', body: '', company: '', role: '', round_type: '', flair: 'Ongoing 🔄' });

    useEffect(() => { fetchPosts(); }, [filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/community/posts', { params: filter });
            setPosts(res.data.posts);
        } catch (err) {
            toast.error("Failed to load feed");
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (id, voteType) => {
        try {
            const res = await api.post(`/community/posts/${id}/vote`, { vote_type: voteType });
            setPosts(posts.map(p => p.id === id ? { ...p, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : p));
        } catch (err) {
            toast.error("Authentication required");
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.body) return;
        try {
            await api.post('/community/posts', newPost);
            toast.success("Contribution published");
            setShowCreateModal(false);
            fetchPosts();
        } catch (err) {
            toast.error("Failed to publish");
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto pb-20 selection:bg-indigo-500/30">
            {/* Apple Style Header */}
            <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="title-page text-white mb-2">Intel Exchange.</h1>
                    <p className="text-xl text-white/40 font-medium tracking-tight">Access real interview pipelines from the global network.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary h-12 px-8 rounded-full text-sm font-bold shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                >
                    <FiPlus /> Deposit Intel
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Filters */}
                <aside className="lg:col-span-3 space-y-8">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-8 sticky top-24">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 flex items-center gap-2">
                            <FiFilter /> Narrow Feed
                        </h3>

                        <div className="space-y-6">
                            <FilterSelect
                                label="Target Company"
                                options={['All', 'Google', 'Meta', 'Amazon', 'Apple', 'Netflix']}
                                value={filter.company}
                                onChange={v => setFilter({ ...filter, company: v === 'All' ? '' : v })}
                            />
                            <FilterSelect
                                label="Interview Type"
                                options={['All', 'Technical', 'Behavioral', 'Onsite']}
                                value={filter.round_type}
                                onChange={v => setFilter({ ...filter, round_type: v === 'All' ? '' : v })}
                            />
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400 flex items-center gap-2">
                                <FiTrendingUp /> Trending
                            </h4>
                            <TrendItem tag="GoogleL5" count="4.2k" />
                            <TrendItem tag="SystemDesign2026" count="1.1k" />
                        </div>
                    </div>
                </aside>

                {/* Feed */}
                <main className="lg:col-span-9 space-y-6">
                    <div className="relative mb-10">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                            placeholder="Search company intel, interview logs, salaries..."
                            className="w-full h-16 bg-white/5 border border-white/5 rounded-[2rem] pl-14 pr-8 text-white focus:border-indigo-500/50 outline-none transition-all"
                        />
                    </div>

                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-64 glass animate-pulse rounded-[2.5rem]" />
                        ))
                    ) : (
                        <div className="space-y-6">
                            {posts.map((post, idx) => (
                                <PostCard key={post.id} post={post} onVote={handleVote} idx={idx} />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-2xl glass p-12 border border-white/10 relative"
                        >
                            <button onClick={() => setShowCreateModal(false)} className="absolute top-10 right-10 text-white/40 hover:text-white">
                                <FiX size={24} />
                            </button>
                            <h2 className="title-section text-white mb-8">Share Intelligence</h2>

                            <div className="space-y-6">
                                <input
                                    className="w-full input-glass !bg-white/5 !border-white/5 !text-white"
                                    placeholder="Brief title of your experience..."
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        className="w-full input-glass !bg-white/5 !border-white/5 !text-white"
                                        placeholder="Company"
                                        value={newPost.company}
                                        onChange={e => setNewPost({ ...newPost, company: e.target.value })}
                                    />
                                    <input
                                        className="w-full input-glass !bg-white/5 !border-white/5 !text-white"
                                        placeholder="Role / Title"
                                        value={newPost.role}
                                        onChange={e => setNewPost({ ...newPost, role: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    className="w-full input-glass !bg-white/5 !border-white/5 !text-white h-48 resize-none"
                                    placeholder="Detail the technical questions, interviewer sentiment, and outcome..."
                                    value={newPost.body}
                                    onChange={e => setNewPost({ ...newPost, body: e.target.value })}
                                />
                                <button onClick={handleCreatePost} className="btn-primary w-full h-14 rounded-2xl font-bold">Declare Intel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PostCard({ post, onVote, idx }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass p-10 border border-white/10 rounded-[3rem] group hover:bg-white/[0.04] transition-all flex gap-10"
        >
            <div className="flex flex-col items-center gap-2 shrink-0">
                <button onClick={() => onVote(post.id, 1)} className="p-2 glass border border-white/5 rounded-full text-white/20 hover:text-indigo-400">
                    <FiChevronUp size={24} />
                </button>
                <span className="text-xs font-black text-white">{post.upvotes - post.downvotes}</span>
                <button onClick={() => onVote(post.id, -1)} className="p-2 glass border border-white/5 rounded-full text-white/20 hover:text-rose-400">
                    <FiChevronDown size={24} />
                </button>
            </div>

            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                    <span className="badge-role">{post.company}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{post.role}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 ml-auto">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors leading-tight">{post.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm line-clamp-2">{post.body}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black text-white">
                            {post.user?.name?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-white/40">{post.user?.name || 'Vetted Candidate'}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/20 hover:text-white transition-colors cursor-pointer">
                            <FiMessageCircle size={16} /> 24
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-white/20">
                            <FiGlobe size={16} /> Shared
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function FilterSelect({ label, options, value, onChange }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 pl-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white appearance-none outline-none focus:border-indigo-500/50"
                >
                    {options.map(o => <option key={o} value={o} className="bg-[#12121a]">{o}</option>)}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
            </div>
        </div>
    );
}

function TrendItem({ tag, count }) {
    return (
        <div className="flex justify-between items-center group cursor-pointer hover:translate-x-1 transition-transform">
            <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">#{tag}</span>
            <span className="text-[10px] font-black text-white/20">{count}</span>
        </div>
    );
}
