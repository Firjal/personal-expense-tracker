'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryManager } from '@/components/categories/CategoryManager';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/actions/categories';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { Category, TransactionType } from '@/lib/types';

export default function CategoriesPage() {
  const { userId, isReady } = useCurrentUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    if (!isReady) return;
    setIsLoading(true);
    const data = await fetchCategories(userId);
    setCategories(data);
    setIsLoading(false);
  }, [userId, isReady]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (name: string, type: TransactionType) => {
    const res = await createCategory(userId, name, type);
    if (res.success) loadCategories();
    return res;
  };

  const handleUpdate = async (id: string, name: string) => {
    const res = await updateCategory(userId, id, name);
    if (res.success) loadCategories();
    return res;
  };

  const handleDelete = async (id: string) => {
    const res = await deleteCategory(userId, id);
    if (res.success) loadCategories();
    return res;
  };

  return (
    <div className="space-y-6">
      <CategoryManager
        categories={categories}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
}
