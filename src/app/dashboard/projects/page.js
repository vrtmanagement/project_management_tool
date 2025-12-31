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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Search, Filter, Grid3x3, List, Briefcase, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ProjectsPage() {
  const { projects, loading, fetchProjects, deleteProject, updateProject } = useProjects();
  const { currentWorkspace, fetchWorkspaces } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const lastFetchedWorkspaceId = useRef(null);
  const hasFetchedWorkspaces = useRef(false);

  const priorityIcons = {
    low: '==',
    medium: '==',
    high: '==',
    urgent: '==',
  };

  const priorityColors = {
    low: 'text-gray-500',
    medium: 'text-orange-500',
    high: 'text-yellow-500',
    urgent: 'text-red-500',
  };

  const priorityLabels = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  const statusLabels = {
    planning: 'Planning',
    active: 'Active',
    'on-hold': 'On Hold',
    completed: 'Completed',
    archived: 'Archived',
  };

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

  const handleStatusChange = async (projectId, newStatus) => {
    await updateProject(projectId, { status: newStatus });
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
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="min-w-[300px] px-4">Project</TableHead>
                  <TableHead className="min-w-[200px] px-4">Assignees</TableHead>
                  <TableHead className="min-w-[120px] px-4">Priority</TableHead>
                  <TableHead className="min-w-[150px] px-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const projectId = project._id;
                  const projectCode = projectId.substring(projectId.length - 6).toUpperCase();

                  return (
                    <TableRow key={projectId} className="hover:bg-muted/30 border-b last:border-b-0">
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-1 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color || '#3b82f6' }}
                          />
                          <div className="flex flex-col min-w-0">
                            <Link
                              href={`/dashboard/projects/${projectId}`}
                              className="text-primary hover:underline font-medium truncate text-sm"
                            >
                              {project.name}
                            </Link>
                            {project.description && (
                              <span className="text-xs text-muted-foreground truncate mt-0.5">
                                {project.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {project.members && project.members.length > 0 ? (
                            <>
                              {project.members.slice(0, 2).map((member, index) => {
                                const userName = member.user?.name || 'Unknown';
                                const initials = userName
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2);

                                return (
                                  <div key={index} className="flex items-center gap-1.5">
                                    <Avatar className="h-7 w-7 border border-background">
                                      <AvatarImage src={member.user?.avatar} />
                                      <AvatarFallback className="text-[10px] bg-teal-500/20 text-teal-500 font-medium">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm whitespace-nowrap">{userName}</span>
                                  </div>
                                );
                              })}
                              {project.members.length > 2 && (
                                <span className="text-sm text-muted-foreground">
                                  +{project.members.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${priorityColors[project.priority] || 'text-orange-500'}`}>
                            {priorityIcons[project.priority] || '=='}
                          </span>
                          <span className="text-sm">{priorityLabels[project.priority] || 'Medium'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4">
                        <Select
                          value={project.status}
                          onValueChange={(value) => handleStatusChange(projectId, value)}
                        >
                          <SelectTrigger className="w-[130px] h-7 bg-muted/50 border-muted-foreground/20 text-sm font-normal hover:bg-muted rounded-md">
                            <SelectValue>
                              {statusLabels[project.status] || project.status}
                            </SelectValue>
                            <ChevronDown className="h-3.5 w-3.5 ml-1 opacity-50" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}


      </div>
    </DashboardLayout>
  );
}
