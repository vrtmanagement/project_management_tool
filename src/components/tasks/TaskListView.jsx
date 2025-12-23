'use client';

import { useMemo } from 'react';
import { useProjects } from '@/context/ProjectContext';
import { TaskCard } from './TaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'in-review', title: 'In Review' },
  { id: 'completed', title: 'Completed' },
];

export function TaskListView({ tasks, projectId, onTaskClick }) {
  const { updateTask, deleteTask } = useProjects();

  const groupedTasks = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.status === column.id),
    }));
  }, [tasks]);

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Tasks List</h3>
          <p className="text-sm text-muted-foreground">
            View all tasks in a structured list. Click a task to view and edit its details.
          </p>
        </div>
        <CreateTaskDialog projectId={projectId} />
      </div>

      <ScrollArea className="h-[calc(100vh-320px)] rounded-md border">
        <div className="divide-y">
          {groupedTasks.map((group) => (
            <div key={group.id} className="bg-card">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {group.title}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              {group.tasks.length === 0 ? (
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  No tasks in this status.
                </div>
              ) : (
                <div className="grid gap-3 px-4 pb-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.tasks.map((task) => (
                    <div key={task._id}>
                      <TaskCard
                        task={task}
                        onClick={() => onTaskClick(task)}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


