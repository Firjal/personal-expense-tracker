import { SupabaseClient } from '@supabase/supabase-js';

export interface UserAuthData {
  id: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    [key: string]: unknown;
  } | null;
  email?: string | null;
}

/**
 * Memastikan user yang login memiliki row di tabel public.profiles.
 * 
 * Aturan:
 * 1. Menggunakan user.id (UUID dari auth.users) sebagai identifier utama sesuai schema database.
 * 2. Cek apakah row profile sudah ada di public.profiles.
 * 3. Jika sudah ada, jangan membuat duplikat atau menimpa data yang ada.
 * 4. Jika belum ada, buat profile secara otomatis menggunakan metadata/email user.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: UserAuthData
): Promise<void> {
  if (!user || !user.id) return;

  try {
    // 1. Cek apakah profile dengan UUID ini sudah ada
    const { data: existing, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('[ensureUserProfile] Gagal memeriksa profile:', checkError.message);
      return;
    }

    // 2. Jika profile sudah ada, jangan buat duplikat
    if (existing) {
      return;
    }

    // 3. Ambil data nama & avatar dari user metadata Google / Auth
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : 'Pengguna');

    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    // 4. Insert row baru ke tabel profiles dengan id = auth.users.id
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
      });

    if (insertError) {
      console.error('[ensureUserProfile] Gagal membuat profile:', insertError.message);
    }
  } catch (err) {
    console.error('[ensureUserProfile] Unexpected error:', err);
  }
}
