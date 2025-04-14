import TaskListPage from "@/src/modules/task-list";

export default async function CategoriesPage({
    params,
}: {
    params: { id: string | "all" };
}) {
    const { id } = await params;

    return (
        <div className="h-full flex items-start justify-start p-4">
            <TaskListPage categoryId={id === "all" ? undefined : id} />
        </div>
    );
}
