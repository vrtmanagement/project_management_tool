'use client';

import { useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProjects } from '@/context/ProjectContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  TrendingUp,
  Users,
  Briefcase,
} from 'lucide-react';

export default function DashboardPage() {
  const { projects, fetchProjects } = useProjects();
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const lastFetchedWorkspaceId = useRef(null);
  const hasFetchedWorkspaces = useRef(false);

  useEffect(() => {
    if (!hasFetchedWorkspaces.current) {
      fetchWorkspaces();
      hasFetchedWorkspaces.current = true;
    }
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (currentWorkspace?._id && lastFetchedWorkspaceId.current !== currentWorkspace._id) {
      lastFetchedWorkspaceId.current = currentWorkspace._id;
      fetchProjects(currentWorkspace._id);
    }
  }, [currentWorkspace?._id, fetchProjects]);

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              {currentWorkspace 
                ? `Welcome back! Overview of ${currentWorkspace.name}`
                : 'Create a workspace to get started'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!currentWorkspace && <CreateWorkspaceDialog />}
            <CreateProjectDialog />
          </div>
        </div>

        {/* Workspace Alert */}
        {!currentWorkspace && (
          <Alert>
            <Briefcase className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <p>Start by creating your first workspace to organize your projects and tasks.</p>
                <CreateWorkspaceDialog />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Projects */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Your active projects and their progress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No projects yet. Create your first project to get started!</p>
                  </div>
                ) : (
                  projects.slice(0, 3).map((project) => (
                    <Link key={project._id} href={`/dashboard/projects/${project._id}`}>
                      <div className="space-y-2 hover:bg-muted/50 p-3 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <p className="font-medium">{project.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">{project.status}</Badge>
                              <span>•</span>
                              <span>{project.priority} priority</span>
                            </div>
                          </div>
                          <span className="text-sm font-medium">View</span>
                        </div>
                        <Progress value={45} className="h-2" />
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {project.members?.slice(0, 3).map((member, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={member.user?.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

