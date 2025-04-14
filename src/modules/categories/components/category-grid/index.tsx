"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useCategories } from "@/src/hooks/useCategories";
import { Task } from "@/types/prisma";
import { useRouter } from "next/navigation";

interface CategoryGridProps {
    searchQuery: string;
    tasks: {
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
        };
        tasks: Task[];
    };
}

export function CategoryGrid({ searchQuery, tasks }: CategoryGridProps) {
    const router = useRouter();
    const { data: categories, isLoading: isLoadingCategories } = useCategories({
        search: searchQuery,
    });

    console.log(tasks);

    const getCategoryTaskCount = (categoryId: string) =>
        (tasks &&
            tasks?.tasks?.filter((task) => task.categoryId === categoryId)
                ?.length) ||
        0;

    if (isLoadingCategories) {
        return (
            <div className="flex h-[450px] items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ScrollArea className="h-full w-full rounded-md">
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card
                        className={
                            "cursor-pointer transition-colors hover:bg-muted/50"
                        }
                        onClick={() => router.push(`/category/all`)}
                    >
                        <CardHeader>
                            <CardTitle>Todas as Tarefas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                {tasks.pagination.total}{" "}
                                {tasks.pagination.total === 1
                                    ? "tarefa"
                                    : "tarefas"}{" "}
                                no total
                            </p>
                        </CardContent>
                    </Card>
                    {categories?.map((category) => (
                        <Card
                            key={category.id}
                            className={
                                "cursor-pointer transition-colors hover:bg-muted/50"
                            }
                            onClick={() =>
                                router.push(`/category/${category.id}`)
                            }
                        >
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {getCategoryTaskCount(category.id)}{" "}
                                    {getCategoryTaskCount(category.id) === 1
                                        ? "tarefa"
                                        : "tarefas"}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
