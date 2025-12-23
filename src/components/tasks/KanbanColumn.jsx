'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export function KanbanColumn({ column, tasks, projectId, onTaskClick, onDeleteTask }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="flex flex-col h-[calc(100vh-300px)]">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${column.color}`} />
            <h3 className="font-semibold">{column.title}</h3>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          <CreateTaskDialog projectId={projectId} defaultStatus={column.id} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-3">
        <ScrollArea className="h-full pr-3">
          <SortableContext
            id={column.id}
            items={tasks.map((task) => task._id)}
            strategy={verticalListSortingStrategy}
          >
            <div ref={setNodeRef} className="space-y-3 min-h-[50px]">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No tasks yet
                </div>
              ) : (
                tasks.map((task) => (
                  <SortableTaskCard
                    key={task._id}
                    task={task}
                    onClick={() => onTaskClick(task)}
                    onDelete={onDeleteTask}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

