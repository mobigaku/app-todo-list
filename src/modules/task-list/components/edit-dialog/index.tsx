"use client";

import { TaskForm } from "@/components/task-form";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { useTasks } from "@/src/hooks/use-tasks";
import { TaskFormValues } from "@/src/types/form";
import { Task } from "@/src/types/prisma";
import { Loader2, PencilIcon } from "lucide-react";
import { toast } from "sonner";

export default function EditDialog({ task }: { task: Task }) {
    const { categories = [] } = useCategories();
    const { isLoading, updateTask } = useTasks();

    const handleEditSubmit = async (data: TaskFormValues) => {
        try {
            if (task) {
                await updateTask({ id: task.id, data });
                toast.success("Tarefa atualizada com sucesso");
            }
        } catch {
            toast.error("Erro ao atualizar tarefa. Tente novamente.");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Editar">
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <PencilIcon className="h-4 w-4" />
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Editar Tarefa</DialogTitle>
                </DialogHeader>
                <TaskForm
                    task={task}
                    categories={categories}
                    onSubmit={handleEditSubmit}
                />
            </DialogContent>
        </Dialog>
    );
}
