import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get('token');

    const [form, setForm] = useState({ new_password: '', confirm: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) setError('Invalid or missing reset token. Please request a new reset link.');
    }, [token]);

    const strength = (pw) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };
    const pw = form.new_password;
    const pwStrength = strength(pw);
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = ['', '#ef4444', '#f59e0b', '#6366f1', '#10b981'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (pw.length < 6) return setError('Password must be at least 6 characters.');
        if (pw !== form.confirm) return setError('Passwords do not match.');

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, new_password: pw });
            setDone(true);
            toast.success('Password reset successful!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to reset password. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-200px', left: '-200px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', bottom: '-100px', right: '-100px', pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: 440, padding: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        InterviewAce
                    </h1>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {done ? (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <FiCheckCircle size={52} style={{ color: '#10b981', marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Password Updated! 🎉</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Redirecting you to login in 3 seconds…
                            </p>
                            <Link to="/login" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                                Go to Login →
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                Set New Password 🔒
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                                Choose a strong password for your account.
                            </p>

                            {error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1.25rem' }}>
                                    <FiAlertCircle style={{ color: '#ef4444', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* New Password */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                                        New Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                            type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters"
                                            value={pw} onChange={e => setForm({ ...form, new_password: e.target.value })} required />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            {showPwd ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                    {/* Strength meter */}
                                    {pw && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', gap: 4, marginBottom: '0.2rem' }}>
                                                {[1, 2, 3, 4].map(i => (
                                                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? strengthColor[pwStrength] : 'var(--border)', transition: 'all 0.3s' }} />
                                                ))}
                                            </div>
                                            <span style={{ fontSize: '0.72rem', color: strengthColor[pwStrength], fontWeight: 600 }}>
                                                {strengthLabel[pwStrength]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                                        Confirm Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <FiLock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input className="input" style={{ paddingLeft: '2.5rem' }}
                                            type="password" placeholder="Repeat your password"
                                            value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                                    </div>
                                    {form.confirm && pw !== form.confirm && (
                                        <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.3rem' }}>Passwords do not match</p>
                                    )}
                                </div>

                                <button type="submit" className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                                    disabled={loading || !token}>
                                    {loading ? <span className="spinner" /> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        ← Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
