import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiSettings, FiBell } from 'react-icons/fi';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';

const themes = [
    { id: 'dark', label: '🌙 Dark', icon: '🌙' },
    { id: 'light', label: '☀️ Light', icon: '☀️' },
    { id: 'glass', label: '🧊 Glass', icon: '🧊' },
    { id: 'cyber', label: '⚡ Cyber', icon: '⚡' },
];

const pageTitles = {
    '/dashboard': 'Dashboard',
    '/dsa': 'DSA Practice',
    '/behavioral': 'Behavioral Interview',
    '/system-design': 'System Design',
    '/mock': 'Mock Interview',
    '/voice-eval': 'Voice Evaluation',
    '/resume': 'Resume ATS Scanner',
    '/community': 'Community Forum',
    '/roles': 'Roles & Roadmaps',
    '/platforms': 'Coding Platforms',
    '/profile': 'My Profile',
};

export default function Topbar() {
    const { theme, setTheme } = useThemeStore();
    const { user } = useAuthStore();
    const location = useLocation();
    const [showThemes, setShowThemes] = useState(false);

    const title = Object.entries(pageTitles).find(([path]) => location.pathname.startsWith(path))?.[1] || 'InterviewAce';

    return (
        <header style={{
            padding: '0.875rem 2rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div>
                <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Theme Switcher */}
                <div style={{ position: 'relative' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.5rem 0.85rem', gap: '0.4rem', fontSize: '0.85rem' }}
                        onClick={() => setShowThemes(!showThemes)}>
                        {themes.find(t => t.id === theme)?.icon} Theme
                    </button>
                    {showThemes && (
                        <div style={{
                            position: 'absolute', top: '110%', right: 0, zIndex: 200,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)', padding: '0.5rem', minWidth: '140px',
                            boxShadow: 'var(--shadow)',
                        }}>
                            {themes.map(t => (
                                <button key={t.id} onClick={() => { setTheme(t.id); setShowThemes(false); }}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'left',
                                        padding: '0.5rem 0.75rem', borderRadius: 4, border: 'none', cursor: 'pointer',
                                        background: theme === t.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                                        color: theme === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem', fontFamily: 'var(--font-main)',
                                        transition: 'all 0.2s',
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notifications (placeholder) */}
                <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                    <FiBell size={18} />
                </button>

                {/* User Avatar */}
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--gradient)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
}
