"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./task-form";
import { useCategories } from "@/hooks/use-categories";
import { useTasks } from "@/hooks/use-tasks";
import type { TaskFormValues } from "@/src/types/form";

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskCreateModal({ open, onOpenChange }: TaskCreateModalProps) {
  const { categories = [] } = useCategories();
  const { createTask } = useTasks();

  const handleSubmit = async (data: TaskFormValues) => {
    try {
      await createTask(data);
      toast.success("Tarefa criada com sucesso");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao criar tarefa. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Crie uma nova tarefa preenchendo os campos abaixo.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          categories={categories}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
} 