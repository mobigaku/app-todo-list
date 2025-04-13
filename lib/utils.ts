import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function formatPriority(priority: string) {
  const priorities = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    MAXIMUM: "Máxima",
  }
  return priorities[priority as keyof typeof priorities] || priority
}

export function formatStatus(status: string) {
  const statuses = {
    PENDING: "Pendente",
    IN_PROGRESS: "Em Progresso",
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
  }
  return statuses[status as keyof typeof statuses] || status
}

export function getStatusColor(status: string) {
  const colors = {
    PENDING: "bg-yellow-500",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
  }
  return colors[status as keyof typeof colors] || "bg-gray-500"
}

export function getPriorityColor(priority: string) {
  const colors = {
    LOW: "bg-blue-500",
    MEDIUM: "bg-yellow-500",
    HIGH: "bg-orange-500",
    MAXIMUM: "bg-red-500",
  }
  return colors[priority as keyof typeof colors] || "bg-gray-500"
}
