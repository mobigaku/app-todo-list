
import { TaskList } from "@/src/modules/task-list/components/task-list";

export default async function CategoriesPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <TaskList categoryId={id} />
    </div>
  );
} 