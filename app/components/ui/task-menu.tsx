"use client";

import { MoreVertical } from "lucide-react"
import { Task } from "@/types/prisma"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { TaskStatusPriority } from "@/components/task-status-priority"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface TaskMenuProps {
  task: Task
  onDelete: (id: string) => Promise<void>
  onEdit: (task: Task) => void
}

export function TaskMenu({ task, onDelete, onEdit }: TaskMenuProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
            Gerenciar status
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(task)}>
            Editar tarefa
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => onDelete(task.id)}
          >
            Excluir tarefa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Status e Prioridade</DialogTitle>
          </DialogHeader>
          <TaskStatusPriority
            task={task}
            onUpdate={() => setShowStatusDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 