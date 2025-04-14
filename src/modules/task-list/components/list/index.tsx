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
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";
import { Priority, Status } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrashIcon } from "lucide-react";
import { SortField, SortOrder } from "../../types";
import { priorityLabels, statusLabels } from "../../utils";
import EditDialog from "../edit-dialog";

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

    return (
        <>
            {tasks.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                    Nenhuma tarefa encontrada.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 w-full">
                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            className={"w-full gap-1 py-0 overflow-hidden "}
                        >
                            <CardHeader
                                className={cn(
                                    "flex flex-row items-center justify-between py-3",
                                    task.status === "COMPLETED" &&
                                        "bg-green-500",
                                    task.status === "CANCELLED" && "bg-red-500",
                                    task.priority === "MAXIMUM" && "bg-red-500",
                                    task.priority === "HIGH" && "bg-yellow-500",
                                    task.priority === "MEDIUM" && "bg-blue-500",
                                    task.priority === "LOW" &&
                                        "dark:bg-gray-700 bg-gray-200"
                                )}
                            >
                                <CardTitle className="flex items-start gap-2 justify-start font-bold lg:text-2xl text-lg lg:flex-row flex-col">
                                    {task.name}{" "}
                                    <span className="md:text-lg text-sm font-normal text-foreground/70">
                                        (Prioridade:{" "}
                                        {priorityLabels[task.priority]})
                                    </span>
                                </CardTitle>

                                <div className="flex items-start gap-2 h-full">
                                    <div
                                        className={cn(
                                            "rounded-lg bg-white text-black p-1 px-2 text-xs font-bold",

                                            task.status === "COMPLETED" &&
                                                "bg-green-100 text-green-500",
                                            task.status === "CANCELLED" &&
                                                "bg-red-100 text-red-500",
                                            task.priority === "MAXIMUM" &&
                                                "bg-red-100 text-red-500",
                                            task.priority === "HIGH" &&
                                                "bg-yellow-100 text-yellow-500",
                                            task.priority === "MEDIUM" &&
                                                "bg-blue-100 text-blue-500",
                                            task.priority === "LOW" &&
                                                "bg-gray-100 text-gray-700"
                                        )}
                                    >
                                        {statusLabels[task.status]}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-3">
                                <div>{task.description}</div>
                            </CardContent>

                            <div className="flex items-center justify-center mx-4">
                                <Separator className=" my-0" />
                            </div>

                            <CardFooter className="justify-between space-x-2 pb-3">
                                <div className="flex lg:flex-row flex-col lg:items-center lg:justify-start justify-center gap-0">
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-semibold"></span>{" "}
                                        {task.createdAt
                                            ? format(task.createdAt, "PPP", {
                                                  locale: ptBR,
                                              })
                                            : "N/A"}
                                    </div>

                                    <Separator
                                        orientation="vertical"
                                        className="h-full"
                                    />

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
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <EditDialog task={task} />
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
            )}
        </>
    );
}
