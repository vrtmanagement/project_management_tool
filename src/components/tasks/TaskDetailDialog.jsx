'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/context/ProjectContext';
import {
  Calendar,
  Clock,
  User,
  Tag,
  FileText,
  Flag,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export function TaskDetailDialog({ task, open, onOpenChange }) {
  const { updateTask } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      });
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    await updateTask(task._id, formData);
    setIsEditing(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-xl font-semibold"
                />
              ) : (
                <DialogTitle className="text-2xl">{task.title}</DialogTitle>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Status
              </Label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="capitalize">
                  {task.status}
                </Badge>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <Label className="flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </Label>
              {isEditing ? (
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          <Separator />

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </Label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {task.dueDate
                  ? format(new Date(task.dueDate), 'MMMM d, yyyy')
                  : 'No due date set'}
              </p>
            )}
          </div>

          <Separator />

          {/* Assigned To */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned To
                </Label>
                <div className="flex flex-wrap gap-2">
                  {task.assignedTo.map((user, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Metadata */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>
                Created {format(new Date(task.createdAt), 'MMM d, yyyy')} by{' '}
                {task.createdBy?.name}
              </span>
            </div>
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Last updated {format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

