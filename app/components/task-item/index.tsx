"use client";

import { Task } from "@/types/prisma";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TaskMenu } from "@/components/task-menu";

interface TaskItemProps {
  task: Task;
  onDelete?: (taskId: string) => Promise<void>;
  onUpdate?: (taskId: string, data: Partial<Task>) => Promise<void>;
}

const priorityColors = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  MAXIMUM: "bg-red-500",
} as const;

const statusColors = {
  PENDING: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
} as const;

const priorityLabels = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  MAXIMUM: "Máxima",
} as const;

const statusLabels = {
  PENDING: "Não Iniciada",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
} as const;

export function TaskItem({ task, onDelete, onUpdate }: TaskItemProps) {
  return (
    <tr key={task.id} className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4 align-middle">{task.name}</td>
      <td className="p-4 align-middle">{task.description}</td>
      <td className="p-4 align-middle">
        <Badge className={priorityColors[task.priority]}>
          {priorityLabels[task.priority]}
        </Badge>
      </td>
      <td className="p-4 align-middle">
        <Badge className={statusColors[task.status]}>
          {statusLabels[task.status]}
        </Badge>
      </td>
      <td className="p-4 align-middle">
        {task.startDate ? format(new Date(task.startDate), "dd/MM/yyyy") : "-"}
      </td>
      <td className="p-4 align-middle">
        {task.endDate ? format(new Date(task.endDate), "dd/MM/yyyy") : "-"}
      </td>
      <td className="p-4 align-middle">{task.category?.name ?? "-"}</td>
      <td className="p-4 align-middle">
        <TaskMenu task={task} onDelete={onDelete} onUpdate={onUpdate} />
      </td>
    </tr>
  );
} 