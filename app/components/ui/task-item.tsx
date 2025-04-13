import { Task } from "@/types/prisma";
import { Badge } from "./badge";
import { TaskMenu } from "./task-menu";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onComplete, onDelete, onEdit }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{task.name}</h3>
          <Badge variant={task.status === "COMPLETED" ? "success" : "default"}>
            {task.status}
          </Badge>
          <Badge variant={task.priority === "HIGH" ? "destructive" : "secondary"}>
            {task.priority}
          </Badge>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>Start: {format(task.startDate, "PPP")}</span>
          {task.endDate && (
            <span>Due: {format(task.endDate, "PPP")}</span>
          )}
        </div>
      </div>
      <TaskMenu
        task={task}
        onComplete={onComplete}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
} 