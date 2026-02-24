import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form.email, form.password);
        if (result.success) { toast.success('Welcome back! 🎉'); navigate('/dashboard'); }
        else toast.error(result.error);
    };

    // Demo login
    const demoLogin = async () => {
        const result = await login('demo@interviewace.com', 'demo123');
        if (result.success) navigate('/dashboard');
        else {
            // Simulate demo for UI preview
            useAuthStore.setState({ user: { name: 'Demo User', email: 'demo@interviewace.com', targetRole: 'Software Engineer' }, token: 'demo', isAuthenticated: true });
            navigate('/dashboard');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
        }}>
            {/* Background blobs */}
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-200px', left: '-200px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', bottom: '-100px', right: '-100px', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 440, padding: '2rem', position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        InterviewAce
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                        Your AI-powered interview coach
                    </p>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome back 👋</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>Sign in to continue your prep journey</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Email */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" style={{ paddingLeft: '2.5rem' }} type="email" placeholder="you@example.com"
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPwd ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }} disabled={isLoading}>
                            {isLoading ? <span className="spinner" /> : 'Sign In'}
                        </button>
                    </form>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>

                    <button onClick={demoLogin} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        🚀 Try Demo (No signup needed)
                    </button>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}>
                        <FiGithub /> Continue with GitHub
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
                </p>
            </div>
        </div>
    );
}
