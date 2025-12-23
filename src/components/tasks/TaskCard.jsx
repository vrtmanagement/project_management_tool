'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MoreVertical, Edit, Trash2, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const priorityColors = {
  low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function TaskCard({ task, onDelete, onClick }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all group"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium line-clamp-2 flex-1">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                // onEdit?.(task);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(task._id);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={priorityColors[task.priority]} size="sm">
            {task.priority}
          </Badge>
          {task.tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="secondary" size="sm">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          {/* Due Date */}
          {task.dueDate ? (
            <div 
              className={`flex items-center gap-1 text-xs ${
                isOverdue 
                  ? 'text-red-500' 
                  : isDueToday 
                  ? 'text-orange-500' 
                  : 'text-muted-foreground'
              }`}
            >
              {isOverdue ? (
                <Clock className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>
                {isOverdue ? 'Overdue' : format(new Date(task.dueDate), 'MMM d')}
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Assigned Users */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignedTo.slice(0, 3).map((user, index) => (
                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignedTo.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

