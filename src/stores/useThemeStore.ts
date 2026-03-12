import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

interface ThemeState {
  theme: Theme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  initialize: () => void;
  resolvedTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      mounted: false,

      setTheme: (newTheme: Theme) => {
        set({ theme: newTheme });
        applyTheme(newTheme === 'system' ? getSystemPreference() : newTheme);
      },

      initialize: () => {
        const { theme } = get();
        applyTheme(theme === 'system' ? getSystemPreference() : theme);
        set({ mounted: true });

        if (theme === 'system') {
          const mql = window.matchMedia('(prefers-color-scheme: dark)');
          mql.addEventListener('change', (e) => {
            if (get().theme === 'system') {
              applyTheme(e.matches ? 'dark' : 'light');
            }
          });
        }
      },

      resolvedTheme: () => {
        const { theme } = get();
        return theme === 'system' ? getSystemPreference() : theme;
      },
    }),
    {
      name: 'rmh-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
