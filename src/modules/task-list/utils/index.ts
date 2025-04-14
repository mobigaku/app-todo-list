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
