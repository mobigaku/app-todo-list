import {
    errorMessages,
    getUserFriendlyErrorMessage,
    handleAPIResponse,
} from "@/lib/error-handling";
import { Task } from "@/types/prisma";
import { TaskInput } from "@/types/task";
import { Priority, Status } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTasksOptions {
    categoryId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    searchQuery?: {
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

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ["tasks", { categoryId, sortBy, sortOrder, searchQuery }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (categoryId) params.append("categoryId", categoryId);
            if (sortBy) params.append("sortBy", sortBy);
            if (sortOrder) params.append("sortOrder", sortOrder);
            if (searchQuery) {
                if (searchQuery.priority)
                    params.append("priority", searchQuery.priority);
                if (searchQuery.status)
                    params.append("status", searchQuery.status);
            }

            const response = await fetch(`/api/tasks?${params.toString()}`);
            return handleAPIResponse<Task[]>(response);
        },
    });

    const { mutate: createTask, isPending: isCreating } = useMutation({
        mutationFn: async (data: TaskInput) => {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return handleAPIResponse<Task>(response);
        },
        onMutate: async (newTask) => {
            await queryClient.cancelQueries({ queryKey: ["tasks"] });
            const previousTasks =
                queryClient.getQueryData<Task[]>(["tasks"]) || [];

            const optimisticTask: Task = {
                id: `temp-${Date.now()}`,
                userId: "",
                ...newTask,
                description: newTask.description || null,
                endDate: newTask.endDate || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            queryClient.setQueryData<Task[]>(["tasks"], (old = []) => [
                ...old,
                optimisticTask,
            ]);

            return { previousTasks };
        },
        onError: (error, newTask, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success(errorMessages.TASK_CREATE_SUCCESS);
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
            return handleAPIResponse<Task>(response);
        },
        onMutate: async ({ taskId, data }) => {
            await queryClient.cancelQueries({ queryKey: ["tasks"] });
            const previousTasks =
                queryClient.getQueryData<Task[]>(["tasks"]) || [];

            queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
                old.map((task) =>
                    task.id === taskId
                        ? { ...task, ...data, updatedAt: new Date() }
                        : task
                )
            );

            return { previousTasks };
        },
        onError: (error, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success(errorMessages.TASK_UPDATE_SUCCESS);
        },
    });

    const { mutate: deleteTask, isPending: isDeleting } = useMutation({
        mutationFn: async (taskId: string) => {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "DELETE",
            });
            return handleAPIResponse<Task>(response);
        },
        onMutate: async (taskId) => {
            await queryClient.cancelQueries({ queryKey: ["tasks"] });
            const previousTasks =
                queryClient.getQueryData<Task[]>(["tasks"]) || [];

            queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
                old.filter((task) => task.id !== taskId)
            );

            return { previousTasks };
        },
        onError: (error, taskId, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success(errorMessages.TASK_DELETE_SUCCESS);
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
