import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/constants/task";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import { Task } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Circle, Loader2, PlayCircle } from "lucide-react";
import { useState } from "react";
import DeleteDialog from "../delete-dialog";
import EditDialog from "../edit-dialog";

const statusIcons = {
    PENDING: Circle,
    IN_PROGRESS: PlayCircle,
    COMPLETED: CheckCircle,
} as const;

// Define the next status mapping
const nextStatus = {
    PENDING: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
    COMPLETED: null,
} as const;

interface TaskCardProps {
    task: Task;
    isLoading: {
        query: boolean;
        create: boolean;
        update: boolean;
        delete: boolean;
    };
}

function NextStatusButton({
    task,
    isLoading,
}: {
    task: Task;
    isLoading: boolean;
}) {
    const { updateTask } = useTasks();
    const [isUpdating, setIsUpdating] = useState(false);
    const next = nextStatus[task.status];

    if (!next) return null;

    const NextIcon = statusIcons[next];

    const handleStatusChange = async () => {
        try {
            setIsUpdating(true);

            await updateTask({
                ...task,
                description: task.description || undefined,
                status: next,
                endDate: next === "COMPLETED" ? new Date() : undefined,
            });
        } catch (error) {
            console.error("Failed to update task status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleStatusChange}
            disabled={isLoading || isUpdating}
            className={cn(
                "h-10 w-10 cursor-pointer relative",
                next === "COMPLETED" && "hover:text-green-500",
                next === "IN_PROGRESS" && "hover:text-blue-500"
            )}
        >
            {isUpdating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <NextIcon className="h-6 w-6" />
            )}
        </Button>
    );
}

export function TaskCard({ task, isLoading }: TaskCardProps) {
    const StatusIcon = statusIcons[task.status];

    return (
        <Card
            className={cn(
                "w-full gap-1 py-0 overflow-hidden border-l-4",
                task.status === "COMPLETED" && "border-l-green-500",
                task.status === "IN_PROGRESS" && "border-l-blue-500",
                task.status === "PENDING" && "border-l-gray-500",
                task.priority === "MAXIMUM" && "border-2 border-red-500",
                task.priority === "HIGH" && "border-2 border-yellow-500"
            )}
        >
            <CardHeader
                className={cn(
                    "flex flex-row items-center justify-between py-3",
                    task.status === "COMPLETED" && "bg-green-500/10",
                    task.status === "IN_PROGRESS" && "bg-blue-500/10",
                    task.status === "PENDING" && "bg-gray-500/10"
                )}
            >
                <div className="flex items-center gap-2">
                    <StatusIcon
                        className={cn(
                            "h-5 w-5",
                            task.status === "COMPLETED" && "text-green-500",
                            task.status === "IN_PROGRESS" && "text-blue-500",
                            task.status === "PENDING" && "text-gray-500"
                        )}
                    />
                    <CardTitle className="flex items-start gap-2 justify-start font-bold lg:text-2xl text-lg lg:flex-row flex-col">
                        {task.name}
                    </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                    <NextStatusButton
                        task={task}
                        isLoading={isLoading.update}
                    />
                    <Badge
                        variant="secondary"
                        className={cn(
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
                        {PRIORITY_LABELS[task.priority]}
                    </Badge>

                    <Badge
                        variant="secondary"
                        className={cn(
                            task.status === "COMPLETED" &&
                                "bg-green-100 text-green-500",
                            task.status === "IN_PROGRESS" &&
                                "bg-blue-100 text-blue-500",
                            task.status === "PENDING" &&
                                "bg-gray-100 text-gray-700"
                        )}
                    >
                        {STATUS_LABELS[task.status]}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-2 pt-3">
                <div>{task.description}</div>
            </CardContent>

            <div className="flex items-center justify-center mx-4">
                <Separator className="my-0" />
            </div>

            <CardFooter className="justify-between space-x-2 pb-3">
                <div className="flex lg:flex-row flex-col lg:items-center lg:justify-start justify-center gap-2">
                    <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Criada em:</span>{" "}
                        {task.createdAt
                            ? format(task.createdAt, "PPP", {
                                  locale: ptBR,
                              })
                            : "N/A"}
                    </div>

                    <Separator
                        orientation="vertical"
                        className="h-4 hidden lg:block"
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
                    <EditDialog task={task} isLoading={isLoading.update} />
                    <DeleteDialog task={task} isLoading={isLoading.delete} />
                </div>
            </CardFooter>
        </Card>
    );
}
