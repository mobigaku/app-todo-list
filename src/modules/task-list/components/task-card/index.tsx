import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/constants/task";
import { cn } from "@/lib/utils";
import { Task } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, Circle, MinusCircle, PlayCircle } from "lucide-react";
import DeleteDialog from "../delete-dialog";
import EditDialog from "../edit-dialog";

const statusIcons = {
    PENDING: Circle,
    IN_PROGRESS: PlayCircle,
    COMPLETED: CheckCircle,
    CANCELLED: MinusCircle,
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

export function TaskCard({ task, isLoading }: TaskCardProps) {
    const StatusIcon = statusIcons[task.status];

    return (
        <Card
            className={cn(
                "w-full gap-1 py-0 overflow-hidden border-l-4",
                task.status === "COMPLETED" && "border-l-green-500",
                task.status === "CANCELLED" && "border-l-red-500",
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
                    task.status === "CANCELLED" && "bg-red-500/10",
                    task.status === "IN_PROGRESS" && "bg-blue-500/10",
                    task.status === "PENDING" && "bg-gray-500/10"
                )}
            >
                <div className="flex items-center gap-2">
                    <StatusIcon
                        className={cn(
                            "h-5 w-5",
                            task.status === "COMPLETED" && "text-green-500",
                            task.status === "CANCELLED" && "text-red-500",
                            task.status === "IN_PROGRESS" && "text-blue-500",
                            task.status === "PENDING" && "text-gray-500"
                        )}
                    />
                    <CardTitle className="flex items-start gap-2 justify-start font-bold lg:text-2xl text-lg lg:flex-row flex-col">
                        {task.name}
                    </CardTitle>
                </div>

                <div className="flex items-center gap-2">
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
                            task.status === "CANCELLED" &&
                                "bg-red-100 text-red-500",
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
