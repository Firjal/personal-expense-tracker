'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CategoryManager } from '@/components/categories/CategoryManager';
import { DemoStore } from '@/lib/storage/demo-store';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/actions/categories';
import { Category, TransactionType } from '@/lib/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserId = (): string => {
    const user = DemoStore.getUser();
    return user ? user.id : 'demo-user-123';
  };

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    const userId = getUserId();
    const data = await fetchCategories(userId);
    setCategories(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreate = async (name: string, type: TransactionType) => {
    const userId = getUserId();
    const res = await createCategory(userId, name, type);
    if (res.success) {
      loadCategories();
    }
    return res;
  };

  const handleUpdate = async (id: string, name: string) => {
    const userId = getUserId();
    const res = await updateCategory(userId, id, name);
    if (res.success) {
      loadCategories();
    }
    return res;
  };

  const handleDelete = async (id: string) => {
    const userId = getUserId();
    const res = await deleteCategory(userId, id);
    if (res.success) {
      loadCategories();
    }
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
