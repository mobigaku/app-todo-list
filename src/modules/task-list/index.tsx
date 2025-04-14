"use client";

import { TaskList } from "@/src/modules/task-list/components/task-list";

export default function TaskListPage({
  params,
}: {
  params: { categoryId: string };
}) {

  return (<div className="flex flex-col items-center justify-center w-full">
      <h1 className="text-3xl font-bold">Suas Tarefas</h1>
    

      <TaskList
        categoryId={params.categoryId}
      />
    </div>
  );
}
