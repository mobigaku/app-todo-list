"use client";

import { Task } from "@/types/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks } from "@/app/hooks/use-tasks";
import { toast } from "sonner";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";
type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

const priorityLabels: Record<Priority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  MAXIMUM: "Máxima",
};

const statusLabels: Record<Status, string> = {
  PENDING: "Não Iniciada",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const priorityColors: Record<Priority, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  MAXIMUM: "bg-red-500",
};

const statusColors: Record<Status, string> = {
  PENDING: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

interface TaskStatusPriorityProps {
  task: Task;
  onUpdate?: () => void;
}

export function TaskStatusPriority({ task, onUpdate }: TaskStatusPriorityProps) {
  const { updateTask, isLoading } = useTasks();

  const handleStatusChange = async (newStatus: Status) => {
    try {
      await updateTask({
        taskId: task.id,
        data: {
          ...task,
          status: newStatus,
          startDate: new Date(task.startDate),
          endDate: task.endDate ? new Date(task.endDate) : null,
        },
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    try {
      await updateTask({
        taskId: task.id,
        data: {
          ...task,
          priority: newPriority,
          startDate: new Date(task.startDate),
          endDate: task.endDate ? new Date(task.endDate) : null,
        },
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update task priority:", error);
      toast.error("Erro ao atualizar prioridade da tarefa");
    }
  };

  const handleQuickComplete = async () => {
    try {
      await updateTask({
        taskId: task.id,
        data: {
          ...task,
          status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED",
          startDate: new Date(task.startDate),
          endDate: task.endDate ? new Date(task.endDate) : null,
        },
      });
      onUpdate?.();
    } catch (error) {
      console.error("Failed to quick complete task:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <Badge className={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickComplete}
          disabled={isLoading.update}
        >
          {task.status === "COMPLETED" ? "Reabrir" : "Concluir"}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">Prioridade</h3>
        <Badge className={priorityColors[task.priority]}>
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          value={task.status}
          onValueChange={(value: Status) => handleStatusChange(value)}
          disabled={isLoading.update}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alterar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Não Iniciada</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
            <SelectItem value="COMPLETED">Concluída</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={task.priority}
          onValueChange={(value: Priority) => handlePriorityChange(value)}
          disabled={isLoading.update}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alterar prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LOW">Baixa</SelectItem>
            <SelectItem value="MEDIUM">Média</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="MAXIMUM">Máxima</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 