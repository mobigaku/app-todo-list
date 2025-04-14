"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/src/lib/utils";
import { Priority, Status } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import { SortField, SortOrder } from "../../types";
import { priorityLabels, statusLabels } from "../../utils";

export default function TaskList({
    categoryId,
    sortField,
    sortOrder,
    statusFilter,
    priorityFilter,
}: {
    categoryId?: string;
    sortField: SortField;
    sortOrder: SortOrder;
    statusFilter: Status | undefined;
    priorityFilter: Priority | undefined;
}) {
    const { tasks = [], isLoading } = useTasks({
        categoryId,
        sortBy: sortField,
        sortOrder,
        searchQuery: {
            priority: priorityFilter,
            status: statusFilter,
        },
    });

    if (isLoading) {
        return <div>Carregando tarefas...</div>;
    }

    return tasks.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
            Nenhuma tarefa encontrada.
        </div>
    ) : (
        <div className="grid grid-cols-1  gap-4 w-full">
            {tasks.map((task) => (
                <Card
                    key={task.id}
                    className={"w-full gap-1 pt-0 overflow-hidden"}
                >
                    <CardHeader
                        className={cn(
                            "flex flex-row items-center justify-between py-3",
                            task.status === "COMPLETED" && "bg-green-500",
                            task.status === "CANCELLED" && "bg-red-500",
                            task.priority === "MAXIMUM" && "bg-red-500",
                            task.priority === "HIGH" && "bg-yellow-500",
                            task.priority === "MEDIUM" && "bg-blue-500",
                            task.priority === "LOW" && "bg-gray-700"
                        )}
                    >
                        <CardTitle className="flex flex-row items-center gap-2 justify-center font-bold text-2xl">
                            {task.name}{" "}
                            <span className="text-lg font-normal text-muted-foreground">
                                (Prioridade: {priorityLabels[task.priority]})
                            </span>
                        </CardTitle>

                        <div>
                            <span className="font-semibold">Status:</span>{" "}
                            {statusLabels[task.status]}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>{task.description}</div>
                    </CardContent>
                    <CardFooter className="justify-between space-x-2">
                        <div className="text-sm text-muted-foreground">
                            <span className="font-semibold">
                                Data de Conclusão:
                            </span>{" "}
                            {task.endDate
                                ? format(task.endDate, "PPP", {
                                      locale: ptBR,
                                  })
                                : "N/A"}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Visualizar"
                                onClick={() => {}} // Will be implemented in task 6.6
                            >
                                <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Editar"
                                onClick={() => {}} // Will be implemented in task 6.7
                            >
                                <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Excluir"
                                onClick={() => {}} // Will be implemented in task 6.7
                            >
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
