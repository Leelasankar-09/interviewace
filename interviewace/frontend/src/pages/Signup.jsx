import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiBriefcase, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'ML Engineer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'Android Developer', 'iOS Developer'];

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', targetRole: '', college: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [step, setStep] = useState(1);
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleNext = (e) => { e.preventDefault(); setStep(2); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(form);
        if (result.success) { toast.success('Account created! Let\'s ace those interviews! 🎯'); navigate('/dashboard'); }
        else toast.error(result.error);
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', top: '-100px', right: '-100px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 480, padding: '2rem', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        InterviewAce
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join 10,000+ developers preparing to ace interviews</p>
                </div>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[1, 2].map(s => (
                        <div key={s} style={{ flex: 1, height: 4, borderRadius: 100, background: step >= s ? 'var(--gradient)' : 'var(--border)', transition: 'all 0.3s' }} />
                    ))}
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {step === 1 ? (
                        <>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create your account</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Step 1 of 2 — Basic info</p>

                            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" style={{ paddingLeft: '2.5rem' }} placeholder="John Doe"
                                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" style={{ paddingLeft: '2.5rem' }} type="email" placeholder="you@example.com"
                                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                            type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters"
                                            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            {showPwd ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}>
                                    Continue →
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Almost there! 🎉</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Step 2 of 2 — Tell us about yourself</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Target Role</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiBriefcase style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                                        <select className="select" style={{ paddingLeft: '2.5rem' }}
                                            value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} required>
                                            <option value="">Select your target role</option>
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                                        College / University <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                                    </label>
                                    <input className="input" placeholder="e.g. IIT Bombay, NIT, etc."
                                        value={form.college} onChange={e => setForm({ ...form, college: e.target.value })} />
                                </div>

                                {/* Feature highlights */}
                                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginTop: '0.5rem' }}>
                                    {['AI-powered real-time feedback', 'Role-specific roadmaps', 'ATS resume scanner', 'Community forum'].map(f => (
                                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ color: 'var(--success)' }}>✓</span> {f}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>← Back</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '0.8rem' }} disabled={isLoading}>
                                        {isLoading ? <span className="spinner" /> : 'Create Account 🚀'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
