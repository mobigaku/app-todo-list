"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@/types/prisma";
import { TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteDialogProps {
    task: Task;
}

export default function DeleteDialog({ task }: DeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const { deleteTask } = useTasks();

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            setOpen(false);
            toast.success("Tarefa excluída com sucesso");
        } catch {
            toast.error("Erro ao excluir tarefa. Tente novamente.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Excluir">
                    <TrashIcon className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Tarefa</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir a tarefa &quot;
                        {task.name}&quot;?
                        <br />
                        <br />
                        Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Excluir
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
