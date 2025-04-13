import { Task } from "@/types/prisma"
import { ScrollArea } from "./scroll-area"
import { TaskMenu } from "./task-menu"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import { format } from "date-fns"

interface TaskListProps {
  tasks: Task[]
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task, status: Task['status']) => void
  className?: string
}

export function TaskList({ tasks, onEdit, onDelete, onStatusChange, className }: TaskListProps) {
  if (!tasks.length) {
    return (
      <div className="flex h-[450px] items-center justify-center text-muted-foreground">
        No tasks found.
      </div>
    )
  }

  return (
    <ScrollArea className={cn("h-[450px] rounded-md border", className)}>
      <div className="p-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="mb-4 flex items-start justify-between rounded-lg border bg-card p-4 last:mb-0"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium leading-none">{task.name}</h3>
                <Badge variant={task.status === 'COMPLETED' ? "success" : "default"}>
                  {task.status === 'COMPLETED' ? "Completed" : "In Progress"}
                </Badge>
                <Badge variant={
                  task.priority === 'HIGH' ? "destructive" :
                  task.priority === 'MEDIUM' ? "warning" :
                  "default"
                }>
                  {task.priority}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Start: {format(new Date(task.startDate), 'PP')}</span>
                {task.endDate && (
                  <span>Due: {format(new Date(task.endDate), 'PP')}</span>
                )}
              </div>
            </div>
            <TaskMenu
              task={task}
              onEdit={() => onEdit?.(task)}
              onDelete={() => onDelete?.(task)}
              onStatusChange={(status) => onStatusChange?.(task, status)}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 