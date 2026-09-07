import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DemoStore } from '@/lib/storage/demo-store';
import { Category } from '@/lib/types';

export async function fetchCategories(userId: string): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return DemoStore.getCategories(userId);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .neq('type', 'savings')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return (data as Category[]).filter(
    c => c.type !== 'savings' && !c.name.toLowerCase().includes('tabungan')
  );
}

export async function createCategory(
  userId: string,
  name: string,
  type: 'expense' | 'income'
): Promise<{ success: boolean; category?: Category; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: 'Nama kategori wajib diisi.' };
  }
  if (type !== 'expense' && type !== 'income') {
    return { success: false, error: 'Tipe kategori hanya boleh Pengeluaran atau Pemasukan.' };
  }

  if (!isSupabaseConfigured()) {
    const cat = DemoStore.addCategory(userId, name.trim(), type);
    return { success: true, category: cat };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: name.trim(),
      type,
      is_default: false,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, category: data as Category };
}

export async function updateCategory(userId: string, id: string, name: string): Promise<{ success: boolean; category?: Category; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: 'Nama kategori wajib diisi.' };
  }

  if (!isSupabaseConfigured()) {
    const updated = DemoStore.updateCategory(userId, id, name.trim());
    if (!updated) return { success: false, error: 'Kategori tidak ditemukan.' };
    return { success: true, category: updated };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, category: data as Category };
}

export async function deleteCategory(userId: string, id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return DemoStore.deleteCategory(userId, id);
  }

  const supabase = createClient();
  // Check if category is used in transactions
  const { count } = await supabase
    .from('transactions')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('user_id', userId);

  if (count && count > 0) {
    return { success: false, error: 'Kategori tidak dapat dihapus karena masih digunakan oleh transaksi.' };
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
