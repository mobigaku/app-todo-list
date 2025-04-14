"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { CategoryGrid } from "@/src/components/ui/category-grid";
import { Layout } from "@/src/components/layout";

export default function HomePage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: tasks, isLoading: isLoadingTasks } = useTasks(selectedCategoryId || undefined);
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

  if (isLoadingTasks || isLoadingCategories) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Layout>
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Suas Categorias</h1>
      
      <CategoryGrid
        categories={categories || []}
        tasks={tasks || []}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />
    </div></Layout>
  );
}
