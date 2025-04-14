"use client";

import { useCategories } from "@/hooks/useCategories";
import { useTasks } from "@/hooks/useTasks";
import { Input } from "@/src/components/ui/input";
import { CategoryGrid } from "@/src/modules/categories/components/category-grid";
import { useState } from "react";
import { CreateCategoryButton } from "./components/create-category-button";

export default function CategoriesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { data: tasks, isLoading: isLoadingTasks } = useTasks();

    if (isLoadingTasks) {
        return (
            <div className="flex h-[450px] items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">Categorias</h1>
                    <CreateCategoryButton />
                </div>

                <Input
                    placeholder="Buscar categorias..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <CategoryGrid searchQuery={searchQuery} tasks={tasks || []} />
        </div>
    );
}
