import { useState, useEffect } from 'react';
import { FiGithub, FiLinkedin, FiGlobe, FiEdit2, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';
import { profileAPI, analyticsAPI } from '../api/services';

export default function Profile() {
    const { user, updateUser } = useAuthStore();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [privacy, setPrivacy] = useState({ college: true, cgpa: false, scores: true, streak: true, email: false });
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        college: user?.college || '',
        cgpa: '',
        target_role: user?.targetRole || '',
        linkedin: '',
        github: '',
        portfolio: '',
    });

    useEffect(() => {
        analyticsAPI.track('page_view', '/profile');
        profileAPI.getMe()
            .then(res => {
                const p = res.data.profile;
                setForm(f => ({
                    ...f,
                    name: p.name || f.name,
                    email: p.email || f.email,
                    bio: p.bio || '',
                    college: p.college || '',
                    cgpa: p.cgpa || '',
                    target_role: p.targetRole || '',
                    linkedin: p.linkedin || '',
                    github: p.github || '',
                    portfolio: p.portfolio || '',
                }));
            })
            .catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await profileAPI.updateMe({
                name: form.name,
                bio: form.bio,
                college: form.college,
                cgpa: form.cgpa,
                target_role: form.target_role,
                linkedin: form.linkedin,
                github: form.github,
                portfolio: form.portfolio,
            });
            updateUser({ name: form.name, targetRole: form.target_role });
            toast.success('Profile saved!');
            setEditing(false);
        } catch {
            toast.error('Could not save profile.');
        } finally {
            setSaving(false);
        }
    };

    const togglePrivacy = (key) => setPrivacy(p => ({ ...p, [key]: !p[key] }));

    const PrivacyToggle = ({ field, label }) => (
        <button onClick={() => togglePrivacy(field)} style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: privacy[field] ? 'var(--success)' : 'var(--text-muted)', padding: '0.2rem 0.5rem', borderRadius: 4, background: privacy[field] ? 'rgba(16,185,129,0.1)' : 'var(--bg-hover)', transition: '0.2s' }}>
            {privacy[field] ? <FiEye size={11} /> : <FiEyeOff size={11} />}
            {privacy[field] ? 'Public' : 'Private'}
        </button>
    );

    // Profile strength
    const fields = [form.bio, form.college, form.cgpa, form.target_role, form.linkedin, form.github, form.portfolio];
    const strength = Math.round((fields.filter(Boolean).length / fields.length) * 100);

    return (
        <div className="animate-fade" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>👤 My Profile</h2>
                {editing ? (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ gap: '0.5rem' }}>
                            <FiSave size={14} /> {saving ? 'Saving…' : 'Save Profile'}
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-outline" onClick={() => setEditing(true)} style={{ gap: '0.5rem' }}>
                        <FiEdit2 size={14} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Avatar + Basic */}
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{
                            width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', color: 'white', fontWeight: 800, margin: '0 auto 1rem',
                        }}>
                            {form.name[0]?.toUpperCase()}
                        </div>
                        {editing ? (
                            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }} />
                        ) : (
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>{form.name}</h3>
                        )}
                        <p style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>{form.targetRole}</p>
                        {editing ? (
                            <textarea className="input" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ textAlign: 'center', fontSize: '0.82rem', resize: 'none' }} />
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{form.bio}</p>
                        )}
                    </div>

                    {/* Profile Strength */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Profile Strength</span>
                            <span style={{ fontWeight: 800, color: strength > 70 ? 'var(--success)' : 'var(--warning)' }}>{strength}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${strength}%`, background: strength > 70 ? 'var(--success)' : 'var(--warning)' }} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            {strength < 100 ? 'Complete your profile to improve visibility' : '🎉 Profile complete!'}
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🔗 Social Links</h3>
                        {[
                            { icon: FiLinkedin, key: 'linkedin', label: 'LinkedIn', color: '#0077b5' },
                            { icon: FiGithub, key: 'github', label: 'GitHub', color: '#6366f1' },
                            { icon: FiGlobe, key: 'portfolio', label: 'Portfolio', color: 'var(--accent)' },
                        ].map(({ icon: Icon, key, label, color }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <Icon size={16} style={{ color, flexShrink: 0 }} />
                                {editing ? (
                                    <input className="input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} />
                                ) : (
                                    <a href={form[key]} target="_blank" rel="noreferrer"
                                        style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {form[key] || `Add ${label}`}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Academic Info */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🎓 Academic & Career</h3>

                        {[
                            { label: 'College / University', key: 'college', privacyKey: 'college' },
                            { label: 'CGPA', key: 'cgpa', privacyKey: 'cgpa' },
                            { label: 'Target Role', key: 'target_role', privacyKey: null },
                        ].map(({ label, key, privacyKey }) => (
                            <div key={key} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
                                    {privacyKey && <PrivacyToggle field={privacyKey} label={label} />}
                                </div>
                                {editing ? (
                                    <input className="input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={{ fontSize: '0.875rem' }} />
                                ) : (
                                    <p style={{ fontSize: '0.875rem', color: privacyKey && !privacy[privacyKey] ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: privacyKey && !privacy[privacyKey] ? 'italic' : 'normal' }}>
                                        {privacyKey && !privacy[privacyKey] ? '🔒 Private' : form[key] || '—'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Privacy Controls */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🔐 Privacy Settings</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Control what others see on your public profile</p>
                        {[
                            { key: 'college', label: 'College/University' },
                            { key: 'cgpa', label: 'CGPA' },
                            { key: 'scores', label: 'Practice Scores' },
                            { key: 'streak', label: 'Streak Data' },
                            { key: 'email', label: 'Email Address' },
                        ].map(({ key, label }) => (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}</span>
                                <PrivacyToggle field={key} label={label} />
                            </div>
                        ))}
                    </div>

                    {/* Quick Stats */}
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📊 Quick Stats</h3>
                        <div className="grid-2">
                            {[
                                { label: 'Problems Solved', value: '134' },
                                { label: 'Mock Interviews', value: '12' },
                                { label: 'Current Streak', value: '12 🔥' },
                                { label: 'ATS Score', value: '78/100' },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{value}</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
