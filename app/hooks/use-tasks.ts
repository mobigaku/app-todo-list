import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, getTasks } from "@/lib/api";
import type { FormValues } from "@/components/ui/task-form";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormValues) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
} 