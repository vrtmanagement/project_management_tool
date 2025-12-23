'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { Spinner } from '@/components/ui/spinner';

export function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:block">
        <DashboardSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

