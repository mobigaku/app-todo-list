// This file is reserved for module-specific utility functions.
// All constants have been moved to their proper locations:
// - Global task constants: src/constants/task.ts (PRIORITY_LABELS, STATUS_LABELS)
// - Module constants: src/modules/task-list/constants/index.ts (SORT_FIELD_LABELS)

import { Priority, Status } from "@/src/types/prisma";
import { SortField } from "../types";

export const priorityLabels: Record<Priority, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    MAXIMUM: "Máxima",
};

export const statusLabels: Record<Status, string> = {
    PENDING: "Não Iniciada",
    IN_PROGRESS: "Em Andamento",
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
};

export const sortFieldLabels: Record<SortField, string> = {
    name: "Nome",
    endDate: "Data de Conclusão",
    priority: "Prioridade",
    status: "Status",
};

// Add any module-specific utility functions here
