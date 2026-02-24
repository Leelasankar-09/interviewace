import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },
    }),
    { name: 'interviewace-theme' }
  )
);

// Apply theme on load
const savedTheme = JSON.parse(localStorage.getItem('interviewace-theme') || '{}')?.state?.theme || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);

export default useThemeStore;
