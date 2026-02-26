import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiSettings, FiBell, FiSearch, FiMonitor, FiCpu, FiCloud } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';

const themes = [
    { id: 'dark', label: 'Dark Mode', icon: FiMoon },
    { id: 'light', label: 'Light Mode', icon: FiSun },
    { id: 'glass', label: 'Glass View', icon: FiMonitor },
    { id: 'cyber', label: 'Cyber Punk', icon: FiCpu },
];

export default function Topbar() {
    const { theme, setTheme } = useThemeStore();
    const { user } = useAuthStore();
    const location = useLocation();
    const [showThemes, setShowThemes] = useState(false);

    return (
        <header
            className="sticky top-0 z-40 flex items-center justify-between px-10 h-16 border-b border-black/5 dark:border-white/5"
            style={{
                background: 'var(--menubar-bg)',
                backdropFilter: 'blur(32px) saturate(200%)',
                WebkitBackdropFilter: 'blur(32px) saturate(200%)'
            }}
        >
            <div className="flex items-center gap-8">
                <div className="relative group focus-within:w-64 w-48 transition-all duration-300">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full h-9 pl-9 pr-4 bg-black/5 dark:bg-white/5 border border-transparent focus:border-indigo-500/50 rounded-full text-xs outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setShowThemes(!showThemes)}
                        className="flex items-center gap-2 px-4 py-1.5 h-9 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-xs font-bold transition-all hover:bg-black/10 dark:hover:bg-white/10"
                    >
                        {themes.find(t => t.id === theme)?.label}
                    </button>

                    <AnimatePresence>
                        {showThemes && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-12 w-48 p-2 glass z-50 overflow-hidden"
                            >
                                {themes.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setTheme(t.id); setShowThemes(false); }}
                                        className={`flex items-center gap-3 w-full p-3 rounded-xl text-xs font-medium transition-all ${theme === t.id
                                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <t.icon size={14} />
                                        {t.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <button className="p-2.5 text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative">
                        <FiBell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </button>
                    <button className="p-2.5 text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
                        <FiSettings size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
}
