"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PRIORITY_COLORS,
    PRIORITY_LABELS,
    STATUS_COLORS,
    STATUS_LABELS,
} from "@/constants/task";
import { useTasks } from "@/src/hooks/use-tasks";
import { Task } from "@/types/prisma";
import { toast } from "sonner";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";
type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface TaskStatusPriorityProps {
    task: Task;
    onUpdate?: () => void;
}

export function TaskStatusPriority({
    task,
    onUpdate,
}: TaskStatusPriorityProps) {
    const { updateTask, isLoading } = useTasks();

    const handleStatusChange = async (newStatus: Status) => {
        try {
            await updateTask({
                id: task.id,
                status: newStatus,
                endDate: task.endDate ? new Date(task.endDate) : undefined,
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
                id: task.id,
                priority: newPriority,
                endDate: task.endDate ? new Date(task.endDate) : undefined,
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
                id: task.id,
                status: task.status === "COMPLETED" ? "PENDING" : "COMPLETED",
                endDate: task.endDate ? new Date(task.endDate) : undefined,
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
                    <h3 className="text-sm font-medium text-muted-foreground">
                        Status
                    </h3>
                    <Badge className={STATUS_COLORS[task.status]}>
                        {STATUS_LABELS[task.status]}
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
                <h3 className="text-sm font-medium text-muted-foreground">
                    Prioridade
                </h3>
                <Badge className={PRIORITY_COLORS[task.priority]}>
                    {PRIORITY_LABELS[task.priority]}
                </Badge>
            </div>

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
    );
}
