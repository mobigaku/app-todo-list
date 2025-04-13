"use client";

import { Category } from "@/types/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
}

export function CategoryGrid({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md border">
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className={cn(
            "cursor-pointer transition-colors hover:bg-muted/50",
            selectedCategory === null && "bg-muted"
          )}
          onClick={() => onSelectCategory(null)}
        >
          <CardHeader>
            <CardTitle>Todas as Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visualize todas as suas tarefas
            </p>
          </CardContent>
        </Card>
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              selectedCategory?.id === category.id && "bg-muted"
            )}
            onClick={() => onSelectCategory(category)}
          >
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize as tarefas desta categoria
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 