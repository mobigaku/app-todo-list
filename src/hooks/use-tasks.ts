import { Priority, Status, Task } from "@/types/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

type SortField = "name" | "startDate" | "endDate" | "priority" | "status";
type SortOrder = "asc" | "desc";

interface UseTasksOptions {
    categoryId?: string | null;
    sortBy?: SortField;
    sortOrder?: SortOrder;
    searchQuery?: {
        name?: string;
        description?: string;
        startDate?: Date;
        endDate?: Date;
        priority?: Priority;
        status?: Status;
    };
}

export function useTasks({
    categoryId,
    sortBy,
    sortOrder,
    searchQuery,
}: UseTasksOptions = {}) {
    const queryClient = useQueryClient();

    const { data: tasks = [], isLoading } = useQuery<Task[]>({
        queryKey: ["tasks", categoryId, sortBy, sortOrder, searchQuery],
        queryFn: async () => {
            const params = new URLSearchParams();

            if (categoryId) {
                params.append("categoryId", categoryId);
            }
            if (sortBy) {
                params.append("sortBy", sortBy);
            }
            if (sortOrder) {
                params.append("sortOrder", sortOrder);
            }
            if (searchQuery) {
                if (searchQuery.name) {
                    params.append("name", searchQuery.name);
                }
                if (searchQuery.description) {
                    params.append("description", searchQuery.description);
                }
                if (searchQuery.startDate) {
                    params.append(
                        "startDate",
                        searchQuery.startDate.toISOString()
                    );
                }
                if (searchQuery.endDate) {
                    params.append("endDate", searchQuery.endDate.toISOString());
                }
                if (searchQuery.priority) {
                    params.append("priority", searchQuery.priority);
                }
                if (searchQuery.status) {
                    params.append("status", searchQuery.status);
                }
            }

            const queryString = params.toString();
            const url = `/api/tasks${queryString ? `?${queryString}` : ""}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Erro ao carregar tarefas");
            }
            return response.json();
        },
    });

    const { mutate: createTask, isPending: isCreating } = useMutation({
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
        onMutate: async (newTask) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["tasks"] });

            // Snapshot the previous value
            const previousTasks =
                queryClient.getQueryData<Task[]>(["tasks"]) || [];

            // Optimistically update to the new value
            const optimisticTask: Task = {
                id: `temp-${Date.now()}`, // Temporary ID
                userId: "", // This will be set by the server
                ...newTask,
                description: newTask.description || null, // Ensure it's always string | null
                endDate: newTask.endDate || null, // Ensure it's always Date | null
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            queryClient.setQueryData<Task[]>(["tasks"], (old = []) => [
                ...old,
                optimisticTask,
            ]);

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (err, newTask, context) => {
            // Rollback to the previous value if there's an error
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error("Erro ao criar tarefa");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tarefa criada com sucesso");
        },
    });

    const { mutate: updateTask, isPending: isUpdating } = useMutation({
        mutationFn: async ({
            taskId,
            data,
        }: {
            taskId: string;
            data: Partial<TaskInput>;
        }) => {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error("Erro ao atualizar tarefa");
            }
            return response.json();
        },
        onMutate: async ({ taskId, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["tasks"] });

            // Snapshot the previous value
            const previousTasks =
                queryClient.getQueryData<Task[]>(["tasks"]) || [];

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
                old.map((task) =>
                    task.id === taskId
                        ? { ...task, ...data, updatedAt: new Date() }
                        : task
                )
            );

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (err, variables, context) => {
            // Rollback to the previous value if there's an error
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error("Erro ao atualizar tarefa");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tarefa atualizada com sucesso");
        },
    });

    const { mutate: deleteTask, isPending: isDeleting } = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Erro ao excluir tarefa");
            }
            return response.json();
        },
        onMutate: async (taskId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["tasks"] });

            // Snapshot the previous value
            const previousTasks =
                queryClient.getQueryData<Task[]>(["tasks"]) || [];

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
                old.filter((task) => task.id !== taskId)
            );

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (err, taskId, context) => {
            // Rollback to the previous value if there's an error
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error("Erro ao excluir tarefa");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tarefa excluída com sucesso");
        },
    });

    return {
        tasks,
        isLoading: {
            query: isLoading,
            create: isCreating,
            update: isUpdating,
            delete: isDeleting,
        },
        createTask,
        updateTask,
        deleteTask,
    };
}

export function useTask(id: string) {
    const queryClient = useQueryClient();

    return useQuery<Task>({
        queryKey: ["tasks", id],
        queryFn: async () => {
            const response = await fetch(`/api/tasks/${id}`);
            if (!response.ok) {
                throw new Error("Erro ao carregar tarefa");
            }
            return response.json();
        },
        initialData: () => {
            // Check if we have the task in the tasks list cache
            const tasks = queryClient.getQueryData<Task[]>(["tasks"]);
            return tasks?.find((task) => task.id === id);
        },
    });
}
