'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useProjects } from '@/context/ProjectContext';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';
import { TaskListView } from '@/components/tasks/TaskListView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Users,
  CheckCircle2,
  LayoutPanelLeft,
  LayoutList,
} from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  planning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  'on-hold': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, tasks, loading, fetchProject, fetchTasks, deleteProject } = useProjects();
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id);
      fetchTasks(params.id);
    }
  }, [params.id]);

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will also be deleted.')) {
      const result = await deleteProject(params.id);
      if (result.success) {
        router.push('/dashboard/projects');
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  if (loading && !currentProject) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      </DashboardLayout>
    );
  }

  if (!currentProject) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <Button className="mt-4" onClick={() => router.push('/dashboard/projects')}>
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/projects')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-8 rounded-full"
                  style={{ backgroundColor: currentProject.color }}
                />
                <h1 className="text-3xl font-bold">{currentProject.name}</h1>
              </div>
              <p className="text-muted-foreground">{currentProject.description}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Info Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Status */}
          <div className="rounded-lg border bg-card p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className={statusColors[currentProject.status]}>
                {currentProject.status}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="rounded-lg border bg-card p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Progress</p>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{progress}%</span>
                  <span className="text-sm text-muted-foreground">
                    {completedTasks}/{totalTasks} tasks
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="rounded-lg border bg-card p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due Date</span>
              </div>
              <p className="text-lg font-semibold">
                {currentProject.endDate
                  ? format(new Date(currentProject.endDate), 'MMM d, yyyy')
                  : 'No due date'}
              </p>
            </div>
          </div>

          {/* Team Members */}
          <div className="rounded-lg border bg-card p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Team Members</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {currentProject.members?.slice(0, 4).map((member, index) => (
                    <Avatar key={index} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={member.user?.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {currentProject.members?.length > 0 && (
                  <span className="text-sm font-medium">
                    {currentProject.members.length} member{currentProject.members.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks View */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                {viewMode === 'board' ? 'Tasks Board' : 'Tasks List'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{tasks.length}</span>
                <span>total tasks</span>
              </div>
            </div>
            <div className="inline-flex rounded-md border bg-muted p-1">
              <Button
                variant={viewMode === 'board' ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
                onClick={() => setViewMode('board')}
              >
                <LayoutPanelLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Board</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="gap-2"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>
          </div>

          {viewMode === 'board' ? (
            <KanbanBoard
              tasks={tasks}
              projectId={params.id}
              onTaskClick={handleTaskClick}
            />
          ) : (
            <TaskListView
              tasks={tasks}
              projectId={params.id}
              onTaskClick={handleTaskClick}
            />
          )}
        </div>

        {/* Task Detail Dialog */}
        <TaskDetailDialog
          task={selectedTask}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
        />
      </div>
    </DashboardLayout>
  );
}

