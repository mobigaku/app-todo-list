"use client";

import { Category, Task } from "@/types/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CategoryGridProps {
  categories: Category[];
  tasks: Task[];
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

export function CategoryGrid({
  categories,
  tasks,
  selectedCategoryId,
  onCategorySelect,
}: CategoryGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryTaskCount = (categoryId: string) =>
    tasks.filter((task) => task.categoryId === categoryId).length;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar categorias..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />
      <ScrollArea className="h-[calc(100vh-16rem)] w-full rounded-md border">
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          <Card
            className={cn(
              "cursor-pointer transition-colors hover:bg-muted/50",
              selectedCategoryId === null && "bg-muted"
            )}
            onClick={() => onCategorySelect(null)}
          >
            <CardHeader>
              <CardTitle>Todas as Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tasks.length} {tasks.length === 1 ? "tarefa" : "tarefas"} no total
              </p>
            </CardContent>
          </Card>
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                selectedCategoryId === category.id && "bg-muted"
              )}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {getCategoryTaskCount(category.id)}{" "}
                  {getCategoryTaskCount(category.id) === 1 ? "tarefa" : "tarefas"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 