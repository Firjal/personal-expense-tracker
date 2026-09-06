'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DemoStore } from '@/lib/storage/demo-store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ id: string; email?: string; full_name?: string } | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const demoUser = DemoStore.getUser();
      setUser(demoUser);
    } else {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          });
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-16 md:mb-8">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
