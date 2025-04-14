"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useCategories } from "@/src/hooks/useCategories";
import { Task } from "@/types/prisma";
import { useRouter } from "next/navigation";

interface CategoryGridProps {
    searchQuery: string;
    tasks: Task[];
}

export function CategoryGrid({ searchQuery, tasks }: CategoryGridProps) {
    const router = useRouter();
    const { data: categories, isLoading: isLoadingCategories } = useCategories({
        search: searchQuery,
    });

    const getCategoryTaskCount = (categoryId: string) =>
        tasks.filter((task) => task.categoryId === categoryId).length;

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
                                {tasks.length}{" "}
                                {tasks.length === 1 ? "tarefa" : "tarefas"} no
                                total
                            </p>
                        </CardContent>
                    </Card>
                    {categories.map((category) => (
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
