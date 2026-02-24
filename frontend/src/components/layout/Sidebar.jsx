import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    FiGrid, FiCode, FiMic, FiLayers, FiPlay, FiFileText,
    FiUsers, FiBriefcase, FiBarChart2, FiUser, FiLogOut,
    FiChevronLeft, FiChevronRight, FiZap, FiHelpCircle, FiClock, FiAward, FiStar
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';

const navItems = [
    { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/dsa', icon: FiCode, label: 'DSA Practice' },
    { to: '/behavioral', icon: FiMic, label: 'Behavioral' },
    { to: '/system-design', icon: FiLayers, label: 'System Design' },
    { to: '/mock', icon: FiPlay, label: 'Mock Interview' },
    { to: '/voice-eval', icon: FiZap, label: 'Voice Eval' },
    { to: '/resume', icon: FiFileText, label: 'Resume ATS' },
    { to: '/community', icon: FiUsers, label: 'Community' },
    { to: '/roles', icon: FiBriefcase, label: 'Roles' },
    { to: '/platforms', icon: FiBarChart2, label: 'Platforms' },
    { to: '/questions', icon: FiHelpCircle, label: 'Question Gen' },
    { to: '/history', icon: FiClock, label: 'History' },
    { to: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
    { to: '/badges', icon: FiStar, label: 'Achievements' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside style={{
            width: collapsed ? '72px' : '240px',
            minHeight: '100vh',
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            overflow: 'hidden',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
        }}>
            {/* Logo */}
            <div style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)',
            }}>
                {!collapsed && (
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        InterviewAce
                    </span>
                )}
                {collapsed && <span style={{ fontSize: '1.3rem' }}>🎯</span>}
                <button onClick={() => setCollapsed(!collapsed)} className="btn btn-ghost" style={{ padding: '0.4rem', minWidth: 'auto' }}>
                    {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
                </button>
            </div>

            {/* Nav Links */}
            <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to} style={{ textDecoration: 'none' }}
                        className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                        {({ isActive }) => (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.65rem 0.85rem',
                                borderRadius: 'var(--radius-sm)',
                                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                                background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: '0.875rem',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                                <Icon size={18} style={{ flexShrink: 0 }} />
                                {!collapsed && <span>{label}</span>}
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'var(--gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user?.email || ''}
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: '0.5rem 0.85rem', fontSize: '0.85rem', color: 'var(--error)' }}>
                    <FiLogOut size={16} />
                    {!collapsed && 'Logout'}
                </button>
            </div>
        </aside>
    );
}
