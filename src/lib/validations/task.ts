import { z } from "zod";

export const updateTaskSchema = z.object({
    name: z.string().min(1, "O nome da tarefa é obrigatório"),
    description: z.string().optional(),
    startDate: z.string().min(1, "Data de início é obrigatória"),
    endDate: z.string().nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    categoryId: z.string().nullable().optional(),
});
