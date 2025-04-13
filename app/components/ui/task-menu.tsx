"use client";

import { MoreVertical } from "lucide-react"
import { Task } from "@/types/prisma"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface TaskMenuProps {
  task: Task
  onComplete: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (task: Task) => void
}

export function TaskMenu({ task, onComplete, onDelete, onEdit }: TaskMenuProps) {
  const isCompleted = task.status === "COMPLETED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onComplete(task.id)}>
          {isCompleted ? "Mark as incomplete" : "Mark as complete"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(task)}>
          Edit task
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => onDelete(task.id)}
        >
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 