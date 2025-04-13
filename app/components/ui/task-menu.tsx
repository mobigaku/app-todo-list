import { MoreVertical } from "lucide-react"
import { Task } from "@/types/prisma"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

interface TaskMenuProps {
  task: Task
  onEdit?: () => void
  onDelete?: () => void
  onStatusChange?: (status: Task['status']) => void
}

export function TaskMenu({ task, onEdit, onDelete, onStatusChange }: TaskMenuProps) {
  const isCompleted = task.status === 'COMPLETED'
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => onStatusChange?.(isCompleted ? 'IN_PROGRESS' : 'COMPLETED')}
          className="cursor-pointer"
        >
          Mark as {isCompleted ? "in progress" : "complete"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onEdit}
          className="cursor-pointer"
        >
          Edit task
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 