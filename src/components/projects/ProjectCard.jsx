'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, FolderKanban, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  planning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  'on-hold': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const priorityColors = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
};

export function ProjectCard({ project, onDelete, onEdit }) {
  const progress = 45; // This would come from actual task completion data

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-12 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div>
              <Link href={`/dashboard/projects/${project._id}`}>
                <CardTitle className="hover:text-primary cursor-pointer line-clamp-1">
                  {project.name}
                </CardTitle>
              </Link>
              <CardDescription className="line-clamp-2 mt-1">
                {project.description || 'No description'}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(project._id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status and Priority */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[project.status]}>
            {project.status}
          </Badge>
          <Badge variant="secondary" className={priorityColors[project.priority]}>
            {project.priority}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Dates */}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {project.startDate && format(new Date(project.startDate), 'MMM d')}
              {project.startDate && project.endDate && ' - '}
              {project.endDate && format(new Date(project.endDate), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((member, index) => (
              <Avatar key={index} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.user?.avatar} />
                <AvatarFallback className="text-xs">
                  {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members?.length > 3 && (
              <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          <Link href={`/dashboard/projects/${project._id}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              View Board
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

