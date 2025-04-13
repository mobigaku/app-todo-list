import { Task } from "@/types/prisma";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskItem } from "./task-item";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, data: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskList({ tasks, onTaskUpdate, onTaskDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center rounded-md border">
        <p className="text-sm text-muted-foreground">
          Nenhuma tarefa encontrada. Crie uma nova tarefa para começar.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md border">
      <div className="p-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
          />
        ))}
      </div>
    </ScrollArea>
  );
}