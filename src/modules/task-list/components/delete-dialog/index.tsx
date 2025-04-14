"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingOverlay } from "@/components/ui/spinner";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@/types/prisma";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteDialogProps {
    task: Task;
}

export default function DeleteDialog({ task }: DeleteDialogProps) {
    const [open, setOpen] = useState(false);
    const { deleteTask, isLoading } = useTasks();

    const handleDelete = async () => {
        try {
            await deleteTask(task.id);
            setOpen(false);
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <LoadingOverlay loading={isLoading.delete}>
                    <DialogHeader>
                        <DialogTitle>Excluir Tarefa</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta tarefa? Esta
                            ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading.delete}
                        >
                            Excluir
                        </Button>
                    </DialogFooter>
                </LoadingOverlay>
            </DialogContent>
        </Dialog>
    );
}
