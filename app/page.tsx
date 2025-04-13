"use client";

import { useState } from "react";
import { useTasks, useTaskMutations } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { TaskList } from "@/app/components/ui/task-list";
import { CategoryGrid } from "@/app/components/ui/category-grid";
import { Task } from "@/types/prisma";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(selectedCategoryId || undefined);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { updateTask, deleteTask } = useTaskMutations();

  if (isLoadingTasks || isLoadingCategories) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Your Tasks</h1>
      
      <CategoryGrid
        categories={categories || []}
        tasks={tasks || []}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />

      <TaskList
        tasks={tasks || []}
        onEdit={(task: Task) => {
          // TODO: Implement task editing in subtask 5.2
          console.log("Edit task:", task);
        }}
        onDelete={(task: Task) => {
          deleteTask(task.id);
        }}
        onStatusChange={(task: Task, status: Task['status']) => {
          updateTask({ id: task.id, data: { status } });
        }}
      />
    </div>
  );
}
