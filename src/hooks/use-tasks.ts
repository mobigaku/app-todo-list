import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task } from "@/types/prisma";
import { toast } from "sonner";

interface TaskInput {
  name: string;
  description?: string | null;
  startDate: Date;
  endDate?: Date | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  categoryId: string;
}

export function useTasks(categoryId?: string | null) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", categoryId],
    queryFn: async () => {
      const url = categoryId
        ? `/api/tasks?categoryId=${categoryId}`
        : "/api/tasks";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erro ao carregar tarefas");
      }
      return response.json();
    },
  });

  const { mutate: createTask } = useMutation({
    mutationFn: async (data: TaskInput) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar tarefa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar tarefa");
    },
  });

  const { mutate: updateTask } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskInput> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar tarefa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar tarefa");
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erro ao excluir tarefa");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir tarefa");
    },
  });

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
  };
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ["tasks", id],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar tarefa");
      }
      return response.json();
    },
  });
} 