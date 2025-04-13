import { Task } from "@/types/prisma";
import { Badge } from "@/components/ui/badge";
import { TaskMenu } from "@/components/ui/task-menu";
import { format } from "date-fns";

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, data: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const handleStatusChange = async (status: string) => {
    await onUpdate(task.id, { status: status as Task["status"] });
  };

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">{task.name}</h3>
          <Badge variant={task.status === "COMPLETED" ? "success" : "secondary"}>
            {task.status}
          </Badge>
          <Badge variant="outline">{task.priority}</Badge>
        </div>
        {task.description && (
          <p className="text-sm text-gray-500">{task.description}</p>
        )}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Start: {format(new Date(task.startDate), "PPP")}</span>
          {task.endDate && (
            <span>Due: {format(new Date(task.endDate), "PPP")}</span>
          )}
        </div>
      </div>
      <TaskMenu
        task={task}
        onStatusChange={handleStatusChange}
        onDelete={() => onDelete(task.id)}
      />
    </div>
  );
} 