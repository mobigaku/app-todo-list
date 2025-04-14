import { Task } from "@/types/prisma";
import { Priority, Status } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseTasksOptions {
    categoryId?: string;
    sortBy?: "name" | "createdAt" | "endDate" | "priority" | "status";
    sortOrder?: "asc" | "desc";
    searchQuery?: {
        priority?: Priority;
        status?: Status;
    };
    page?: number;
    limit?: number;
}

interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

interface TasksResponse {
    tasks: Task[];
    pagination: PaginationMetadata;
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
    sortBy = "createdAt",
    sortOrder = "desc",
    searchQuery,
    page = 1,
    limit = 10,
}: UseTasksOptions = {}) {
    const queryClient = useQueryClient();

    function buildQueryString() {
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

        if (searchQuery?.priority) {
            params.append("priority", searchQuery.priority);
        }

        if (searchQuery?.status) {
            params.append("status", searchQuery.status);
        }

        if (page) {
            params.append("page", page.toString());
        }

        if (limit) {
            params.append("limit", limit.toString());
        }

        return params.toString();
    }

    const { data, isLoading: isQueryLoading } = useQuery<TasksResponse>({
        queryKey: [
            "tasks",
            categoryId,
            sortBy,
            sortOrder,
            searchQuery,
            page,
            limit,
        ],
        queryFn: async () => {
            const response = await fetch(`/api/tasks?${buildQueryString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch tasks");
            }
            return response.json();
        },
    });

    const { mutate: createTask, isPending: isCreateLoading } = useMutation({
        mutationFn: async (task: {
            name: string;
            description?: string;
            categoryId?: string;
        }) => {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            });

            if (!response.ok) {
                throw new Error("Failed to create task");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tarefa criada com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao criar tarefa");
        },
    });

    const { mutate: updateTask, isPending: isUpdateLoading } = useMutation({
        mutationFn: async ({
            id,
            ...task
        }: {
            id: string;
            name?: string;
            description?: string;
            status?: Status;
            priority?: Priority;
            endDate?: Date;
        }) => {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(task),
            });

            if (!response.ok) {
                throw new Error("Failed to update task");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tarefa atualizada com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao atualizar tarefa");
        },
    });

    const { mutate: deleteTask, isPending: isDeleteLoading } = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete task");
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Tarefa excluída com sucesso!");
        },
        onError: () => {
            toast.error("Erro ao excluir tarefa");
        },
    });

    return {
        tasks: data?.tasks ?? [],
        pagination: data?.pagination,
        isLoading: {
            query: isQueryLoading,
            create: isCreateLoading,
            update: isUpdateLoading,
            delete: isDeleteLoading,
        },
        createTask,
        updateTask,
        deleteTask,
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
