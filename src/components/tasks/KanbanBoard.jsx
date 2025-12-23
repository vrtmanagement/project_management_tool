'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useProjects } from '@/context/ProjectContext';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'in-review', title: 'In Review', color: 'bg-yellow-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
];

export function KanbanBoard({ tasks, projectId, onTaskClick }) {
  const [activeTask, setActiveTask] = useState(null);
  const { updateTask, deleteTask } = useProjects();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    // Find the task being moved
    const task = tasks.find((t) => t._id === taskId);
    
    if (task && task.status !== newStatus) {
      // Optimistically update the UI
      await updateTask(taskId, { status: newStatus });
    }

    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
              projectId={projectId}
              onTaskClick={onTaskClick}
              onDeleteTask={handleDeleteTask}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-50">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

