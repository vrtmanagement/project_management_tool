'use client';

import { AuthProvider } from '@/context/AuthContext';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ProjectProvider>
          {children}
          <Toaster />
        </ProjectProvider>
      </WorkspaceProvider>
    </AuthProvider>
  );
}

