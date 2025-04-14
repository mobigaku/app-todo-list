import { Priority, Status } from "@/types/prisma";

export const PRIORITY_LABELS: Record<Priority, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    MAXIMUM: "Máxima",
};

export const STATUS_LABELS: Record<Status, string> = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em Progresso",
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
    LOW: "bg-green-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-orange-500",
    MAXIMUM: "bg-red-500",
};

export const STATUS_COLORS: Record<Status, string> = {
    PENDING: "bg-gray-500",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
};
