'use client';

import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProjects } from '@/context/ProjectContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateWorkspaceDialog } from '@/components/workspace/CreateWorkspaceDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Search, Filter, Grid3x3, List, Briefcase } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProjectsPage() {
  const { projects, loading, fetchProjects, deleteProject } = useProjects();
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              {currentWorkspace 
                ? `Manage projects in ${currentWorkspace.name}`
                : 'Create a workspace to get started'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!currentWorkspace && <CreateWorkspaceDialog />}
            <CreateProjectDialog />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {!currentWorkspace ? (
          <Alert>
            <Briefcase className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>You need to create a workspace first before creating projects.</p>
                <CreateWorkspaceDialog />
              </div>
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Alert>
            <AlertDescription>
              {searchQuery || statusFilter !== 'all'
                ? 'No projects found matching your filters.'
                : 'No projects yet. Create your first project to get started!'}
            </AlertDescription>
          </Alert>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            }
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && projects.length > 0 && (
          <div className="border-t pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{projects.length}</div>
                <div className="text-sm text-muted-foreground">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {projects.filter((p) => p.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {projects.filter((p) => p.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {projects.filter((p) => p.status === 'planning').length}
                </div>
                <div className="text-sm text-muted-foreground">Planning</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
