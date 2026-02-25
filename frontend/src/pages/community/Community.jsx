// src/pages/community/Community.jsx
import { useState, useEffect } from 'react';
import {
    FiThumbsUp, FiMessageCircle, FiPlus, FiX, FiFilter,
    FiHash, FiUser, FiActivity, FiGlobe, FiChevronUp, FiChevronDown
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

    useEffect(() => {
        fetchPosts();
    }, [filter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/community/posts', { params: filter });
            setPosts(res.data.posts);
        } catch (err) {
            toast.error("Failed to load forum");
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (id, voteType) => {
        try {
            const res = await api.post(`/community/posts/${id}/vote`, { vote_type: voteType });
            setPosts(posts.map(p => p.id === id ? { ...p, upvotes: res.data.upvotes, downvotes: res.data.downvotes } : p));
        } catch (err) {
            toast.error("Login to vote");
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.body) return;
        try {
            await api.post('/community/posts', newPost);
            toast.success("Experience Shared!");
            setShowCreateModal(false);
            fetchPosts();
        } catch (err) {
            toast.error("Failed to create post");
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Community Forum</h2>
                    <p className="text-text-secondary text-sm">Real interview experiences from fellow candidates.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary px-8 py-4 rounded-2xl shadow-glow"
                >
                    <FiPlus /> Share Your Story
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar: Filters & Trends */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
                            <FiFilter /> Filter Results
                        </h3>
                        <div className="space-y-4">
                            <FilterSelect
                                label="Company"
                                options={['All', 'Google', 'Amazon', 'Meta', 'Netflix', 'Microsoft']}
                                value={filter.company}
                                onChange={(v) => setFilter({ ...filter, company: v === 'All' ? '' : v })}
                            />
                            <FilterSelect
                                label="Round Type"
                                options={['All', 'Technical', 'System Design', 'Behavioral', 'Manager']}
                                value={filter.round_type}
                                onChange={(v) => setFilter({ ...filter, round_type: v === 'All' ? '' : v })}
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600/10 to-transparent border border-white/5 rounded-3xl p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                            <FiActivity /> Trending
                        </h3>
                        <div className="space-y-3">
                            <TrendItem tag="GoogleL4" count="1.2k" />
                            <TrendItem tag="DSA_Hard" count="850" />
                            <TrendItem tag="OfferRescinded" count="420" />
                        </div>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />)
                    ) : (
                        posts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onVote={(type) => handleVote(post.id, type)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-bg-card border border-white/10 rounded-[2.5rem] w-full max-w-2xl p-10 overflow-hidden relative shadow-2xl"
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors"
                            >
                                <FiX size={24} />
                            </button>

                            <h3 className="text-2xl font-bold mb-8">Post New Experience</h3>

                            <div className="space-y-4">
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none"
                                    placeholder="Catchy title for your experience..."
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm"
                                        placeholder="Company"
                                        value={newPost.company}
                                        onChange={e => setNewPost({ ...newPost, company: e.target.value })}
                                    />
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm"
                                        placeholder="Role (e.g. SDE-1)"
                                        value={newPost.role}
                                        onChange={e => setNewPost({ ...newPost, role: e.target.value })}
                                    />
                                </div>
                                <textarea
                                    className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm resize-none focus:border-indigo-500 outline-none"
                                    placeholder="Write the details here... What questions were asked? How was the interviewer?"
                                    value={newPost.body}
                                    onChange={e => setNewPost({ ...newPost, body: e.target.value })}
                                />
                                <button
                                    onClick={handleCreatePost}
                                    className="w-full btn btn-primary py-4 rounded-xl font-bold"
                                >
                                    Publish Post
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PostCard({ post, onVote }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/[0.07] transition-all flex gap-6">
            <div className="flex flex-col items-center gap-1 shrink-0">
                <button
                    onClick={() => onVote(1)}
                    className="p-1 hover:bg-white/10 rounded-md text-text-muted hover:text-indigo-400 transition-all"
                >
                    <FiChevronUp size={24} />
                </button>
                <span className="text-xs font-black">{post.upvotes - post.downvotes}</span>
                <button
                    onClick={() => onVote(-1)}
                    className="p-1 hover:bg-white/10 rounded-md text-text-muted hover:text-pink-400 transition-all"
                >
                    <FiChevronDown size={24} />
                </button>
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest">{post.company}</span>
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 text-[10px] font-black uppercase tracking-widest">{post.role}</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest ml-auto">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                <h4 className="text-lg font-bold tracking-tight text-white leading-tight underline-offset-4 decoration-indigo-500/40">{post.title}</h4>
                <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">{post.body}</p>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {post.user?.name?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-text-muted">{post.user?.name || 'Anonymous User'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-text-muted">
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <FiMessageCircle size={16} /> 12 Comments
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                            <FiGlobe size={16} /> Public
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FilterSelect({ label, options, value, onChange }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-text-secondary outline-none appearance-none cursor-pointer"
            >
                {options.map(o => <option key={o} value={o} className="bg-bg-card">{o}</option>)}
            </select>
        </div>
    );
}

function TrendItem({ tag, count }) {
    return (
        <div className="flex justify-between items-center group cursor-pointer">
            <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">#{tag}</span>
            <span className="text-[10px] font-black text-text-muted">{count} posts</span>
        </div>
    );
}
