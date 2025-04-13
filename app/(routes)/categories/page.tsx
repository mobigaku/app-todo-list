"use client";

import { useState } from "react";
import { CategoryGrid } from "@/components/ui/category-grid";
import { CategoryModal } from "@/components/ui/category-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useTasks } from "@/hooks/use-tasks";

export default function CategoriesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { categories } = useCategories();
  const { tasks } = useTasks(selectedCategoryId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <CategoryModal>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </CategoryModal>
      </div>

      <CategoryGrid
        categories={categories || []}
        tasks={tasks || []}
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />
    </div>
  );
} 