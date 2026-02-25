// src/pages/community/PostDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMessageSquare, FiArrowLeft, FiSend, FiUser } from 'react-icons/fi';
import api from '../../api/axios';

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            const res = await api.get(`/community/post/${id}`);
            setPost(res.data);
        };
        fetchPost();
    }, [id]);

    if (!post) return <div className="p-20 text-center animate-pulse">Loading Discussion...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 text-sm font-bold"
            >
                <FiArrowLeft /> Back to Community
            </button>

            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <FiUser />
                    </div>
                    <div>
                        <h4 className="font-bold text-white text-lg">{post.author}</h4>
                        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{post.company} • {post.role}</p>
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">{post.body}</p>
            </div>

            <div className="space-y-6">
                <h4 className="text-sm font-bold opacity-30 uppercase tracking-widest ml-4">Discussion ({post.comments?.length || 0})</h4>

                <div className="relative group">
                    <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Add to the discussion..."
                        className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 pr-20 text-sm focus:border-indigo-500/50 outline-none transition-all resize-none h-32"
                    />
                    <button className="absolute right-4 bottom-4 w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-glow hover:scale-105 active:scale-95 transition-all">
                        <FiSend />
                    </button>
                </div>

                <div className="space-y-4">
                    {post.comments?.map(c => (
                        <div key={c.id} className="bg-white/5 border border-white/5 rounded-3xl p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]"><FiUser /></div>
                                <span className="text-xs font-bold">{c.author}</span>
                                <span className="text-[10px] text-text-muted">• {new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-text-secondary">{c.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
