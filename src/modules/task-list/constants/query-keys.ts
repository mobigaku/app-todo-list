import { Priority, Status } from "@/types/prisma";

interface TaskFilters {
    categoryId?: string;
    status?: Status;
    priority?: Priority;
    search?: string;
    page?: number;
    limit?: number;
}

export const TASK_KEYS = {
    all: ["tasks"] as const,
    lists: () => [...TASK_KEYS.all, "list"] as const,
    list: (filters: TaskFilters) => [...TASK_KEYS.lists(), filters] as const,
    details: () => [...TASK_KEYS.all, "detail"] as const,
    detail: (id: string) => [...TASK_KEYS.details(), id] as const,
} as const;
