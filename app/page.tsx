"use client";

import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/lib/api";
import { TaskList } from "@/app/components/ui/task-list";
import { Task } from "@/types/prisma";

export default function HomePage() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => getTasks(),
  });

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Tasks</h1>
      <TaskList
        tasks={tasks || []}
        onEdit={(task: Task) => {
          // TODO: Implement task editing in subtask 5.2
          console.log("Edit task:", task);
        }}
        onDelete={(task: Task) => {
          // TODO: Implement task deletion in subtask 5.3
          console.log("Delete task:", task);
        }}
        onStatusChange={(task: Task, status: Task['status']) => {
          // TODO: Implement task status update in subtask 5.4
          console.log("Update task status:", task, status);
        }}
      />
    </div>
  );
}
