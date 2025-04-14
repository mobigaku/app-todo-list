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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/ui/spinner";
import { useTasks } from "@/hooks/use-tasks";
import { Task } from "@/types/prisma";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface EditDialogProps {
    task: Task;
    isLoading?: boolean;
}

export default function EditDialog({
    task,
    isLoading: externalLoading,
}: EditDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(task.name);
    const [description, setDescription] = useState(task.description || "");
    const { updateTask, isLoading } = useTasks();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateTask({
                taskId: task.id,
                data: {
                    ...task,
                    name,
                    description,
                    startDate: new Date(task.startDate),
                    endDate: task.endDate ? new Date(task.endDate) : null,
                },
            });
            setOpen(false);
        } catch (error) {
            console.error("Failed to update task:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={externalLoading}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <LoadingOverlay loading={isLoading.update || externalLoading}>
                    <DialogHeader>
                        <DialogTitle>Editar Tarefa</DialogTitle>
                        <DialogDescription>
                            Faça as alterações necessárias na tarefa. Clique em
                            salvar quando terminar.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label
                                    htmlFor="description"
                                    className="text-right"
                                >
                                    Descrição
                                </Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading.update}>
                                Salvar alterações
                            </Button>
                        </DialogFooter>
                    </form>
                </LoadingOverlay>
            </DialogContent>
        </Dialog>
    );
}
