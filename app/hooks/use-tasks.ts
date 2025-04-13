import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask, deleteTask } from "@/app/lib/api";
import type { TaskFormValues } from "@/app/types/form";
import { toast } from "sonner";

export function useTasks() {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa criada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao criar tarefa");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskFormValues }) =>
      updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa atualizada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao atualizar tarefa");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Tarefa excluída com sucesso");
    },
    onError: () => {
      toast.error("Erro ao excluir tarefa");
    },
  });

  return {
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isLoading: {
      create: createTaskMutation.isPending,
      update: updateTaskMutation.isPending,
      delete: deleteTaskMutation.isPending,
    },
  };
} 