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
        mutationFn: async ({
            id,
            data,
        }: {
            id: string;
            data: Partial<TaskInput>;
        }) => {
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
