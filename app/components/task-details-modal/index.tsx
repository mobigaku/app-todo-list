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
import { Badge } from "@/components/ui/badge";

const priorityLabels: Record<string, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  MAXIMUM: "Máxima",
};

const statusLabels: Record<string, string> = {
  PENDING: "Não Iniciada",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-green-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  MAXIMUM: "bg-red-500",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
};

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

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Prioridade
                </h3>
                <Badge className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <Badge className={statusColors[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
              </div>

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

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Data de Conclusão
                </h3>
                <p className="text-sm">
                  {task.endDate
                    ? format(new Date(task.endDate), "PPP", { locale: ptBR })
                    : "Não definida"}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Categoria
                </h3>
                <p className="text-sm">
                  {task.category?.name || "Sem categoria"}
                </p>
              </div>

              <div className="flex gap-2 pt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onEdit?.(task)}
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => onDelete?.(task)}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
} 