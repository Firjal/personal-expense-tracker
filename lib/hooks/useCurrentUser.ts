import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';
import { ensureUserProfile } from '@/lib/supabase/profile';

export interface CurrentUser {
  id: string;
  email?: string;
  full_name?: string;
}

/**
 * Returns the currently authenticated user.
 *
 * - If Supabase is configured → reads from supabase.auth.getUser() (real session).
 * - Otherwise → reads from DemoStore (demo / local mode).
 *
 * `userId` is guaranteed to be a non-empty string once `isReady` is true.
 */
export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const demoUser = DemoStore.getUser();
      setUser(demoUser);
      setIsReady(true);
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          full_name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0],
        });
        // Pastikan row profile ada di database
        ensureUserProfile(supabase, data.user);
      }
      setIsReady(true);
    });
  }, []);

  return {
    user,
    userId: user?.id ?? 'demo-user-123',
    isReady,
  };
}
