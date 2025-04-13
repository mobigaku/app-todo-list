"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/app/lib/api";
import { Task, Category } from "@/types/prisma";
import { TaskDetailsModal } from "@/app/components/task-details-modal";
import { useTasks } from "@/app/hooks/use-tasks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskFilters } from "@/app/components/task-filters";
import { useFilters } from "@/app/hooks/use-filters";

interface TaskWithCategory extends Task {
  category: Category | null;
}

interface TaskListProps {
  onEdit?: (task: TaskWithCategory) => void;
  onDelete?: (task: TaskWithCategory) => void;
  onStatusChange?: (task: TaskWithCategory) => void;
}

function TaskCard({ task, onClick }: { 
  task: TaskWithCategory; 
  onClick: () => void;
}) {
  return (
    <div
      className="rounded-lg border p-4 hover:bg-accent cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{task.name}</h3>
        <div className="flex gap-2">
          <Badge variant="outline">{task.priority}</Badge>
          <Badge>{task.status}</Badge>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {task.description || "Sem descrição"}
      </p>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Conclusão: {task.endDate ? format(new Date(task.endDate), "PPP", { locale: ptBR }) : "Não definida"}
        </div>
        <div className="text-sm text-muted-foreground">
          {task.category?.name || "Sem categoria"}
        </div>
      </div>
    </div>
  );
}

export function TaskList({ onEdit }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithCategory | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteTask, isLoading } = useTasks();
  const { filters } = useFilters();

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery<TaskWithCategory[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }

    // Filter by priority
    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      const taskStartDate = new Date(task.startDate);
      if (taskStartDate < startDate) {
        return false;
      }
    }

    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      const taskEndDate = task.endDate ? new Date(task.endDate) : null;
      if (taskEndDate && taskEndDate > endDate) {
        return false;
      }
    }

    // Filter by category
    if (filters.categoryId !== "all" && task.categoryId !== filters.categoryId) {
      return false;
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const taskName = task.name.toLowerCase();
      const taskDescription = task.description?.toLowerCase() || "";
      const categoryName = task.category?.name.toLowerCase() || "";

      return (
        taskName.includes(searchTerm) ||
        taskDescription.includes(searchTerm) ||
        categoryName.includes(searchTerm)
      );
    }

    return true;
  });

  const handleTaskClick = (task: TaskWithCategory) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleEdit = (task: TaskWithCategory) => {
    setIsDetailsOpen(false);
    onEdit?.(task);
  };

  const handleDelete = (task: TaskWithCategory) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setIsDeleteDialogOpen(false);
      setIsDetailsOpen(false);
    }
  };

  if (isLoadingTasks) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <TaskFilters />

      <div className="mt-6 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))
        )}
      </div>

      <TaskDetailsModal
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa &ldquo;{selectedTask?.name}&rdquo;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading.delete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading.delete}
              className="bg-red-500 hover:bg-red-600"
            >
              {isLoading.delete ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 