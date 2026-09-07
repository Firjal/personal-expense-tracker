import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ensureUserProfile } from '@/lib/supabase/profile';

/**
 * OAuth Callback Route
 *
 * Supabase redirects here after the user completes Google OAuth.
 * This handler exchanges the one-time `code` for a user session
 * and then forwards the user to the dashboard (or back to login on error).
 *
 * Redirect URI that must be registered in both:
 *   - Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
 *   - Google Cloud Console → OAuth 2.0 → Authorized redirect URIs
 *       (point these to the Supabase callback, not directly here)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    // No code present — redirect to login with a descriptive error
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('OAuth callback tidak valid: kode tidak ditemukan.')}`
    );
  }

  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[auth/callback] Missing Supabase environment variables');
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Konfigurasi Supabase belum disetel di server.')}`
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Login Google gagal. Silakan coba lagi.')}`
    );
  }

  // Ensure user has a profile row in public.profiles table
  if (data?.user) {
    await ensureUserProfile(supabase, data.user);
  }

  // Successful login — redirect to the originally requested protected page
  // or fallback to /dashboard.
  return NextResponse.redirect(`${origin}${next}`);
}
