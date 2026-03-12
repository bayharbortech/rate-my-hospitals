import { create } from 'zustand';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'rmh-install-dismissed';
const DISMISS_DAYS = 30;

interface PWAState {
  canInstall: boolean;
  isDismissed: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  initialize: () => (() => void);
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

export const usePWAStore = create<PWAState>((set, get) => ({
  canInstall: false,
  isDismissed: false,
  deferredPrompt: null,

  initialize: () => {
    if (typeof window === 'undefined') return () => {};

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
        set({ isDismissed: true });
      } else {
        localStorage.removeItem(DISMISS_KEY);
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      set({
        deferredPrompt: e as BeforeInstallPromptEvent,
        canInstall: true,
      });
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  },

  promptInstall: async () => {
    const { deferredPrompt } = get();
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      set({ canInstall: false });
    }
    set({ deferredPrompt: null });
  },

  dismiss: () => {
    set({ isDismissed: true });
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  },
}));
