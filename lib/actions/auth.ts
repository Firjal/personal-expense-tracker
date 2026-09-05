import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';

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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Instruksi reset password telah dikirim ke email Anda.' };
}
