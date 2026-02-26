import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
    FiGrid, FiCode, FiMic, FiLayers, FiPlay, FiFileText,
    FiUsers, FiBriefcase, FiBarChart2, FiUser, FiLogOut,
    FiChevronLeft, FiChevronRight, FiZap, FiHelpCircle, FiClock, FiAward, FiStar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
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
    { to: '/tracker', icon: FiBriefcase, label: 'Applications' },
    { to: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
    { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 260 }}
            className="h-screen sticky top-0 flex flex-col glass border-r border-white/10 shrink-0 z-50 overflow-hidden"
            style={{
                background: 'var(--sidebar-bg)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)'
            }}
        >
            {/* Logo area */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                        >
                            InterviewAce
                        </motion.span>
                    )}
                </AnimatePresence>
                {collapsed && <span className="text-2xl">🎯</span>}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-text-secondary"
                >
                    {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                ? 'bg-indigo-500/15 border border-indigo-500/20 text-indigo-500'
                                : 'text-text-secondary hover:bg-white/5'
                            }`
                        }
                    >
                        <Icon className="shrink-0 group-hover:scale-110 transition-transform" size={20} />
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-medium tracking-wide whitespace-nowrap"
                            >
                                {label}
                            </motion.span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-6 border-t border-white/5 space-y-4">
                {!collapsed && (
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-bold text-text-primary truncate">{user?.name || 'Candidate'}</h4>
                            <p className="text-[10px] uppercase font-black tracking-widest text-text-muted">Pro Member</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
                >
                    <FiLogOut size={18} />
                    {!collapsed && <span className="text-sm font-bold">Logout</span>}
                </button>
            </div>
        </motion.aside>
    );
}
