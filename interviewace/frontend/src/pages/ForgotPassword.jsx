import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [devLink, setDevLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setSent(true);
            // Dev mode: backend returns reset URL directly
            if (res.data?.reset_url) setDevLink(res.data.reset_url);
        } catch (err) {
            toast.error(err?.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
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

                <div className="card" style={{ padding: '2rem' }}>
                    {!sent ? (
                        <>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                Forgot your password? 🔑
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                                Enter your email and we'll send you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <FiMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            style={{ paddingLeft: '2.5rem' }}
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                                    disabled={loading}
                                >
                                    {loading ? <span className="spinner" /> : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <FiCheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check your email</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                                If an account is registered with <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>, you'll receive a password reset link shortly.
                            </p>

                            {/* DEV-ONLY: show reset link directly */}
                            {devLink && (
                                <div style={{
                                    background: 'rgba(99,102,241,0.1)', border: '1px solid var(--accent)',
                                    borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem',
                                    marginBottom: '1.25rem', textAlign: 'left',
                                }}>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                        🛠 DEV MODE — Reset Link:
                                    </p>
                                    <a href={devLink} style={{ fontSize: '0.78rem', color: 'var(--accent)', wordBreak: 'break-all' }}>
                                        {devLink}
                                    </a>
                                </div>
                            )}

                            <button onClick={() => { setSent(false); setDevLink(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
                                ← Try a different email
                            </button>
                        </div>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <FiArrowLeft size={14} /> Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
