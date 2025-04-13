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
import { X } from "lucide-react";

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

function ActiveFilters({ filters, onClearFilter }: { 
  filters: {
    status: string;
    priority: string;
    dateRange: {
      startDate: string | null;
      endDate: string | null;
    };
    categoryId: string;
    search: string;
  }; 
  onClearFilter: (key: string) => void;
}) {
  const activeFilters = [];

  if (filters.status !== "all") {
    activeFilters.push({
      key: "status",
      label: `Status: ${filters.status === "PENDING" ? "Não Iniciada" :
        filters.status === "IN_PROGRESS" ? "Em Andamento" :
        filters.status === "COMPLETED" ? "Concluída" :
        filters.status === "CANCELLED" ? "Cancelada" : filters.status}`,
    });
  }

  if (filters.priority !== "all") {
    activeFilters.push({
      key: "priority",
      label: `Prioridade: ${filters.priority === "LOW" ? "Baixa" :
        filters.priority === "MEDIUM" ? "Média" :
        filters.priority === "HIGH" ? "Alta" :
        filters.priority === "MAXIMUM" ? "Máxima" : filters.priority}`,
    });
  }

  if (filters.dateRange.startDate || filters.dateRange.endDate) {
    const dateLabel = [];
    if (filters.dateRange.startDate) {
      dateLabel.push(`De: ${format(new Date(filters.dateRange.startDate), "PPP", { locale: ptBR })}`);
    }
    if (filters.dateRange.endDate) {
      dateLabel.push(`Até: ${format(new Date(filters.dateRange.endDate), "PPP", { locale: ptBR })}`);
    }
    activeFilters.push({
      key: "dateRange",
      label: dateLabel.join(" "),
    });
  }

  if (filters.categoryId !== "all") {
    activeFilters.push({
      key: "categoryId",
      label: "Categoria selecionada",
    });
  }

  if (filters.search) {
    activeFilters.push({
      key: "search",
      label: `Pesquisa: ${filters.search}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {filter.label}
          <X
            className="h-3 w-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter(filter.key);
            }}
          />
        </Badge>
      ))}
    </div>
  );
}

export function TaskList({ onEdit }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithCategory | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteTask, isLoading } = useTasks();
  const { filters, setStatus, setPriority, setDateRange, setCategory, setSearch, clear } = useFilters();

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

  const handleClearFilter = (key: string) => {
    switch (key) {
      case "status":
        setStatus("all");
        break;
      case "priority":
        setPriority("all");
        break;
      case "dateRange":
        setDateRange({ startDate: null, endDate: null });
        break;
      case "categoryId":
        setCategory("all");
        break;
      case "search":
        setSearch("");
        break;
    }
  };

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

      <ActiveFilters filters={filters} onClearFilter={handleClearFilter} />

      <div className="mt-6 space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filters.status !== "all" || filters.priority !== "all" || filters.dateRange.startDate || filters.dateRange.endDate || filters.categoryId !== "all" || filters.search ? (
              <>
                <p>Nenhuma tarefa corresponde aos filtros selecionados.</p>
                <button
                  onClick={() => clear()}
                  className="text-primary hover:underline mt-2"
                >
                  Limpar todos os filtros
                </button>
              </>
            ) : (
              "Nenhuma tarefa encontrada."
            )}
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