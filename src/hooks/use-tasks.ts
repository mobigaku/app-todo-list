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

// Query key factory for better type safety and consistency
const taskKeys = {
    all: ["tasks"] as const,
    lists: () => [...taskKeys.all, "list"] as const,
    list: (filters: UseTasksOptions) => [...taskKeys.lists(), filters] as const,
    details: () => [...taskKeys.all, "detail"] as const,
    detail: (id: string) => [...taskKeys.details(), id] as const,
};

export function useTasks({
    categoryId,
    sortBy,
    sortOrder,
    searchQuery,
}: UseTasksOptions = {}) {
    const queryClient = useQueryClient();

    // Helper function to build the query string
    const buildQueryString = (options: UseTasksOptions) => {
        const params = new URLSearchParams();
        if (options.categoryId) params.append("categoryId", options.categoryId);
        if (options.sortBy) params.append("sortBy", options.sortBy);
        if (options.sortOrder) params.append("sortOrder", options.sortOrder);
        if (options.searchQuery) {
            if (options.searchQuery.priority)
                params.append("priority", options.searchQuery.priority);
            if (options.searchQuery.status)
                params.append("status", options.searchQuery.status);
        }
        return params.toString();
    };

    // Helper function to prefetch tasks with different filters
    const prefetchTasks = async (options: UseTasksOptions) => {
        const queryString = buildQueryString(options);
        await queryClient.prefetchQuery({
            queryKey: taskKeys.list(options),
            queryFn: async () => {
                const response = await fetch(`/api/tasks?${queryString}`);
                return handleAPIResponse<Task[]>(response);
            },
        });
    };

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery }),
        queryFn: async () => {
            const queryString = buildQueryString({
                categoryId,
                sortBy,
                sortOrder,
                searchQuery,
            });
            const response = await fetch(`/api/tasks?${queryString}`);
            return handleAPIResponse<Task[]>(response);
        },
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
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
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: taskKeys.lists(),
            });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(
                taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery })
            );

            // Optimistically update to the new value
            const optimisticTask: Task = {
                id: `temp-${Date.now()}`,
                userId: "",
                ...newTask,
                description: newTask.description || null,
                endDate: newTask.endDate || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            queryClient.setQueryData<Task[]>(
                taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery }),
                (old = []) => [...old, optimisticTask]
            );

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (error, newTask, context) => {
            if (context?.previousTasks) {
                // Rollback to the previous value if there was an error
                queryClient.setQueryData(
                    taskKeys.list({
                        categoryId,
                        sortBy,
                        sortOrder,
                        searchQuery,
                    }),
                    context.previousTasks
                );
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: taskKeys.lists(),
            });
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
            await queryClient.cancelQueries({
                queryKey: taskKeys.lists(),
            });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData<Task[]>(
                taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery })
            );

            // Optimistically update to the new value
            queryClient.setQueryData<Task[]>(
                taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery }),
                (old = []) =>
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
                queryClient.setQueryData(
                    taskKeys.list({
                        categoryId,
                        sortBy,
                        sortOrder,
                        searchQuery,
                    }),
                    context.previousTasks
                );
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.lists(),
            });
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
            await queryClient.cancelQueries({
                queryKey: taskKeys.lists(),
            });

            const previousTasks = queryClient.getQueryData<Task[]>(
                taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery })
            );

            queryClient.setQueryData<Task[]>(
                taskKeys.list({ categoryId, sortBy, sortOrder, searchQuery }),
                (old = []) => old.filter((task) => task.id !== taskId)
            );

            return { previousTasks };
        },
        onError: (error, taskId, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(
                    taskKeys.list({
                        categoryId,
                        sortBy,
                        sortOrder,
                        searchQuery,
                    }),
                    context.previousTasks
                );
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: taskKeys.lists(),
            });
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
        prefetchTasks,
    };
}

export function useTask(id: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: async () => {
            const response = await fetch(`/api/tasks/${id}`);
            if (!response.ok) {
                throw new Error("Erro ao carregar tarefa");
            }
            return response.json();
        },
        initialData: () => {
            // Check if we have the task in any of the list queries
            const tasks = queryClient
                .getQueriesData<Task[]>({ queryKey: taskKeys.lists() })
                .flatMap(([, data]) => data || []);
            return tasks.find((task) => task.id === id);
        },
    });
}
