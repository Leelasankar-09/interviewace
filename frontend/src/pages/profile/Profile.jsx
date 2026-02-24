import { useState, useEffect } from 'react';
import { FiGithub, FiLinkedin, FiGlobe, FiEdit2, FiEye, FiEyeOff, FiSave, FiTwitter, FiCode, FiUser, FiShield, FiBriefcase, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { authAPI } from '../api/services';

export default function Profile() {
    const { user, updateUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', bio: '', college: '', cgpa: '', target_role: '', target_companies: '',
        linkedin_url: '', github_url: '', portfolio_url: '', twitter_url: '', avatar_url: '',
        leetcode_username: '', codeforces_username: '', codechef_username: '', gfg_username: '', hackerrank_username: '', atcoder_username: '',
        is_public: true, is_college_public: true, is_cgpa_public: true, is_scores_public: true, is_streak_public: true, is_email_public: false
    });

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                bio: user.bio || '',
                college: user.college || '',
                cgpa: user.cgpa || '',
                target_role: user.target_role || '',
                target_companies: user.target_companies || '',
                linkedin_url: user.linkedin_url || '',
                github_url: user.github_url || '',
                portfolio_url: user.portfolio_url || '',
                twitter_url: user.twitter_url || '',
                avatar_url: user.avatar_url || '',
                leetcode_username: user.leetcode_username || '',
                codeforces_username: user.codeforces_username || '',
                codechef_username: user.codechef_username || '',
                gfg_username: user.gfg_username || '',
                hackerrank_username: user.hackerrank_username || '',
                atcoder_username: user.atcoder_username || '',
                is_public: user.is_public ?? true,
                is_college_public: user.is_college_public ?? true,
                is_cgpa_public: user.is_cgpa_public ?? true,
                is_scores_public: user.is_scores_public ?? true,
                is_streak_public: user.is_streak_public ?? true,
                is_email_public: user.is_email_public ?? false,
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(form);
            updateUser(res.data.user);
            toast.success('Profile updated successfully!');
            setEditing(false);
        } catch (error) {
            toast.error('Failed to update profile.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const togglePrivacy = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

    const PrivacyToggle = ({ field, label, editing: isEditing }) => (
        <button
            onClick={() => isEditing && togglePrivacy(field)}
            disabled={!isEditing}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-all ${form[field] ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                } ${isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
        >
            {form[field] ? <FiEye size={10} /> : <FiEyeOff size={10} />}
            {form[field] ? 'Public' : 'Private'}
        </button>
    );

    // Profile strength calculation
    const strengthFields = ['bio', 'college', 'cgpa', 'target_role', 'linkedin_url', 'github_url', 'leetcode_username'];
    const strength = Math.round((strengthFields.filter(f => !!form[f]).length / strengthFields.length) * 100);

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 animate-fade">

            {/* Header */}
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-warm-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-warm-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            {form.avatar_url ? (
                                <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-serif text-terracotta">{form.name[0]?.toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        {editing && (
                            <button className="absolute bottom-0 right-0 p-2 bg-terracotta shadow-md text-white rounded-full hover:bg-terracotta-800 transition-all">
                                <FiEdit2 size={12} />
                            </button>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-slate-900">{form.name || 'Set Your Name'}</h1>
                        <p className="text-terracotta font-bold text-sm tracking-wide">{form.target_role || 'No Target Role'}</p>
                        <div className="flex gap-2 mt-3">
                            <span className="px-3 py-1 bg-warm-50 text-slate-500 text-[11px] font-bold rounded-full border border-warm-100 uppercase tracking-widest flex items-center gap-1.5">
                                <FiAward className="text-terracotta" /> Pro Member
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    {editing ? (
                        <>
                            <button onClick={() => setEditing(false)} className="px-6 py-2 border-2 border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-terracotta text-white rounded-xl font-bold hover:bg-terracotta-800 shadow-lg shadow-terracotta/20 transition-all">
                                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all">
                            <FiEdit2 /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Bio, Strength, Socials */}
                <div className="space-y-8">
                    {/* Bio Card */}
                    <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-sm">
                        <h3 className="text-lg font-serif text-slate-900 mb-4 flex items-center gap-2">
                            <FiUser className="text-terracotta" size={18} /> About Me
                        </h3>
                        {editing ? (
                            <textarea
                                value={form.bio}
                                onChange={e => setForm({ ...form, bio: e.target.value })}
                                placeholder="Write a short professional bio..."
                                className="w-full p-4 bg-warm-50 border border-warm-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-none h-32"
                            />
                        ) : (
                            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line italic">
                                {form.bio || 'Add a bio to tell others about yourself.'}
                            </p>
                        )}

                        {/* Profile Strength */}
                        <div className="mt-8 pt-8 border-t border-warm-100">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Strength</span>
                                <span className="text-sm font-bold text-terracotta">{strength}%</span>
                            </div>
                            <div className="h-2 w-full bg-warm-100 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${strength > 80 ? 'bg-emerald-500' : 'bg-terracotta'}`} style={{ width: `${strength}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                {strength < 100 ? 'Add social links and platform handles to reach 100%' : '🎉 Profile looks great!'}
                            </p>
                        </div>
                    </div>

                    {/* Social Links Card */}
                    <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-sm">
                        <h3 className="text-lg font-serif text-slate-900 mb-6 font-bold tracking-tight">External Links</h3>
                        <div className="space-y-5">
                            {[
                                { icon: FiLinkedin, label: 'LinkedIn', key: 'linkedin_url', color: 'text-blue-600' },
                                { icon: FiGithub, label: 'GitHub', key: 'github_url', color: 'text-slate-900' },
                                { icon: FiTwitter, label: 'Twitter', key: 'twitter_url', color: 'text-sky-500' },
                                { icon: FiGlobe, label: 'Portfolio', key: 'portfolio_url', color: 'text-terracotta' },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <item.icon className={item.color} /> {item.label}
                                    </div>
                                    {editing ? (
                                        <input
                                            value={form[item.key]}
                                            onChange={e => setForm({ ...form, [item.key]: e.target.value })}
                                            className="w-full p-2.5 bg-warm-50 border border-warm-100 rounded-xl text-xs focus:outline-none"
                                            placeholder={`https://...`}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 truncate">
                                            {form[item.key] ? (
                                                <a href={form[item.key]} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-600 hover:text-terracotta transition-colors flex items-center gap-1">
                                                    {form[item.key].replace(/^https?:\/\/(www\.)?/, '')} <FiExternalLink size={10} />
                                                </a>
                                            ) : (
                                                <span className="text-sm text-slate-300 italic">Not connected</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Columns: Education, Platforms, Privacy */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Professional Info */}
                    <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 flex items-center gap-2 border-b border-warm-100 pb-4 mb-2">
                            <FiBriefcase className="text-terracotta" size={18} />
                            <h3 className="text-xl font-serif text-slate-900">Career & Education</h3>
                        </div>

                        {[
                            { label: 'Full Name', key: 'name' },
                            { label: 'Target Job Role', key: 'target_role' },
                            { label: 'Active College/University', key: 'college', privacyKey: 'is_college_public' },
                            { label: 'Current CGPA / Grade', key: 'cgpa', privacyKey: 'is_cgpa_public' },
                            { label: 'Target Companies', key: 'target_companies' },
                        ].map((field, i) => (
                            <div key={i} className={field.label === 'Target Companies' ? 'md:col-span-2' : ''}>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                                    {field.privacyKey && <PrivacyToggle field={field.privacyKey} editing={editing} />}
                                </div>
                                {editing ? (
                                    <input
                                        value={form[field.key]}
                                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                        className="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/10"
                                    />
                                ) : (
                                    <p className={`text-base font-bold text-slate-800 ${field.privacyKey && !form[field.privacyKey] ? 'opacity-40 italic font-mono text-sm' : ''}`}>
                                        {field.privacyKey && !form[field.privacyKey] ? '🔒 Hidden from Public' : (form[field.key] || '—')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Platform Usernames */}
                    <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-sm">
                        <h3 className="text-xl font-serif text-slate-900 mb-8 flex items-center gap-2">
                            <FiCode className="text-terracotta" size={18} /> Performance Platforms
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {[
                                { label: 'LeetCode', key: 'leetcode_username' },
                                { label: 'Codeforces', key: 'codeforces_username' },
                                { label: 'CodeChef', key: 'codechef_username' },
                                { label: 'GeeksforGeeks', key: 'gfg_username' },
                                { label: 'HackerRank', key: 'hackerrank_username' },
                                { label: 'AtCoder', key: 'atcoder_username' },
                            ].map((p, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{p.label}</label>
                                    {editing ? (
                                        <input
                                            value={form[p.key]}
                                            onChange={e => setForm({ ...form, [p.key]: e.target.value })}
                                            className="w-full p-2.5 bg-warm-100 border-none rounded-xl text-xs font-bold focus:outline-none focus:bg-warm-200"
                                            placeholder="Username"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 group cursor-pointer p-2 hover:bg-warm-50 rounded-xl transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-warm-50 flex items-center justify-center text-slate-400 group-hover:text-terracotta transition-colors">
                                                <FiExternalLink size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600 truncate">{form[p.key] || '—'}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security & Global Privacy */}
                    <div className="bg-white p-8 rounded-3xl border border-warm-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <FiShield className="text-slate-900" size={18} />
                            <h3 className="text-xl font-serif text-slate-900">Privacy & Visibility</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-12">
                            {[
                                { label: 'Make Profile Searchable & Public', key: 'is_public' },
                                { label: 'Show Score History in Leaderboard', key: 'is_scores_public' },
                                { label: 'Show Daily Practice Streak', key: 'is_streak_public' },
                                { label: 'Show Email Address', key: 'is_email_public' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-4 border-b border-warm-100 last:border-0">
                                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                    <div
                                        onClick={() => editing && togglePrivacy(item.key)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all ${form[item.key] ? 'bg-terracotta' : 'bg-warm-300'
                                            } ${!editing && 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-all ${form[item.key] ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
