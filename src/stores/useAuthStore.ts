import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAdmin: false,
  isLoading: true,
  isInitialized: false,

  fetchUser: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      set({ user, isLoading: false, isInitialized: true });

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        set({ isAdmin: profile?.is_admin || false });
      }
    } catch {
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user, isInitialized: true, isLoading: false }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  clear: () => set({ user: null, isAdmin: false, isInitialized: false, isLoading: true }),
}));
