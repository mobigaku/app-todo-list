"use client";

import { Category, Task } from "@/types/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: Category[];
  tasks: Task[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryGrid({ categories, tasks, selectedCategoryId, onCategorySelect }: CategoryGridProps) {
  const allTasksCount = tasks.length;
  const getTaskCountForCategory = (categoryId: string) => {
    return tasks.filter(task => task.categoryId === categoryId).length;
  };

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {/* All Categories Card */}
        <Card 
          className={cn(
            "cursor-pointer hover:bg-accent/50 transition-colors",
            !selectedCategoryId && "bg-accent"
          )}
          onClick={() => onCategorySelect(null)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Todas as Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {allTasksCount} {allTasksCount === 1 ? "tarefa" : "tarefas"}
            </p>
          </CardContent>
        </Card>

        {/* Individual Category Cards */}
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              "cursor-pointer hover:bg-accent/50 transition-colors",
              selectedCategoryId === category.id && "bg-accent"
            )}
            onClick={() => onCategorySelect(category.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {getTaskCountForCategory(category.id)}{" "}
                {getTaskCountForCategory(category.id) === 1 ? "tarefa" : "tarefas"}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {categories.length === 0 && (
          <Card className="col-span-full text-center p-6">
            <CardContent>
              <p className="text-muted-foreground">
                Nenhuma categoria encontrada. Crie uma nova categoria para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
} 