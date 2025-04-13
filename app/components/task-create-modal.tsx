"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/app/components/ui/task-form";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTask } from "@/app/hooks/use-tasks";
import { PlusIcon } from "lucide-react";
import { FormValues } from "@/app/components/ui/task-form";

export function TaskCreateModal() {
  const [open, setOpen] = useState(false);
  const { categories = [] } = useCategories();
  const createTask = useCreateTask();

  const handleSubmit = async (data: FormValues) => {
    try {
      await createTask.mutateAsync(data);
      toast.success("Tarefa criada com sucesso");
      setOpen(false);
    } catch {
      toast.error("Erro ao criar tarefa. Tente novamente.");
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2"
      >
        <PlusIcon className="h-4 w-4" />
        Nova Tarefa
      </Button>
      <TaskForm
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleSubmit}
        categories={categories}
      />
    </>
  );
} 