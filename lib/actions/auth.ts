import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';

/**
 * Initiate Google OAuth sign-in via Supabase.
 *
 * Returns { url } on success — the caller must redirect the browser to that URL.
 * Supabase will handle the OAuth flow and redirect back to /auth/callback.
 */
export async function signInWithGoogle(): Promise<{ url?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        'Google login membutuhkan konfigurasi Supabase. ' +
        'Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di file .env.local.',
    };
  }

  const supabase = createClient();

  // redirectTo must be an absolute URL that is registered in:
  //   - Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
  //   - Google Cloud Console → OAuth 2.0 → Authorized redirect URIs (pointing to Supabase callback)
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        // Request offline access so Supabase can refresh the token.
        access_type: 'offline',
        // Force account picker so users can switch accounts easily.
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function loginUser(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    // Demo mode login
    const name = email.split('@')[0];
    const user = {
      id: 'demo-user-123',
      email,
      full_name: name.charAt(0).toUpperCase() + name.slice(1),
    };
    DemoStore.setUser(user);
    return { success: true, user, isDemo: true };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function registerUser(email: string, password: string, fullName: string) {
  if (!isSupabaseConfigured()) {
    // Demo mode register
    const user = {
      id: 'demo-user-' + Math.random().toString(36).substring(2, 8),
      email,
      full_name: fullName,
    };
    DemoStore.setUser(user);
    return { success: true, user, isDemo: true };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function logoutUser() {
  if (!isSupabaseConfigured()) {
    DemoStore.setUser(null);
    return { success: true };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function resetPassword(email: string) {
  if (!isSupabaseConfigured()) {
    return { success: true, message: 'Link reset password telah dikirim (Mode Demo).' };
  }

  const supabase = createClient();
  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Instruksi reset password telah dikirim ke email Anda.' };
}
