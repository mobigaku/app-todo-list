"use client";

import { Task, Category } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { TaskStatusPriority } from "@/components/task-status-priority";

interface TaskWithCategory extends Task {
  category: Category | null;
}

interface TaskDetailsModalProps {
  task: TaskWithCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (task: TaskWithCategory) => void;
  onDelete?: (task: TaskWithCategory) => void;
}

export function TaskDetailsModal({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TaskDetailsModalProps) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">{task.name}</SheetTitle>
          <SheetDescription>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Descrição
                </h3>
                <p className="text-sm">
                  {task.description || "Sem descrição"}
                </p>
              </div>

              <TaskStatusPriority task={task} />

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Data de Início
                </h3>
                <p className="text-sm">
                  {task.startDate
                    ? format(new Date(task.startDate), "PPP", { locale: ptBR })
                    : "Não definida"}
                </p>
              </div>

              {task.endDate && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Data de Conclusão
                  </h3>
                  <p className="text-sm">
                    {format(new Date(task.endDate), "PPP", { locale: ptBR })}
                  </p>
                </div>
              )}

              {task.category && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Categoria
                  </h3>
                  <p className="text-sm">{task.category.name}</p>
                </div>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="flex justify-end gap-2 mt-6">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(task)}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 