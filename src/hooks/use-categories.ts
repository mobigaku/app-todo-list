import { CATEGORY_KEYS } from "@/modules/categories/constants/query-keys";
import { Category } from "@/types/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query key factory for better type safety and consistency
const categoryKeys = {
    all: ["categories"] as const,
    lists: () => [...categoryKeys.all, "list"] as const,
    details: () => [...categoryKeys.all, "detail"] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
};

async function getCategories(): Promise<Category[]> {
    const response = await fetch("/api/categories");
    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }
    return response.json();
}

async function createCategoryFn(data: { name: string; description?: string }) {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to create category");
    }
    return response.json();
}

async function updateCategoryFn({
    id,
    ...data
}: {
    id: string;
    name?: string;
    description?: string;
}) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error("Failed to update category");
    }
    return response.json();
}

async function deleteCategoryFn(id: string) {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) {
        throw new Error("Failed to delete category");
    }
}

export function useCategories() {
    const queryClient = useQueryClient();

    const { data: categories = [], isLoading } = useQuery({
        queryKey: CATEGORY_KEYS.lists(),
        queryFn: getCategories,
    });

    const { mutate: createCategory, isPending: isCreating } = useMutation({
        mutationFn: createCategoryFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
        },
    });

    const { mutate: updateCategory, isPending: isUpdating } = useMutation({
        mutationFn: updateCategoryFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
        },
    });

    const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
        mutationFn: deleteCategoryFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.lists() });
        },
    });

    return {
        categories,
        createCategory,
        updateCategory,
        deleteCategory,
        isLoading: {
            list: isLoading,
            create: isCreating,
            update: isUpdating,
            delete: isDeleting,
        },
    };
}

export function useCategory(id: string) {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: categoryKeys.detail(id),
        queryFn: async () => {
            const response = await fetch(`/api/categories/${id}`);
            if (!response.ok) {
                throw new Error("Erro ao carregar categoria");
            }
            return response.json();
        },
        initialData: () => {
            // Check if we have the category in the list query
            const categories = queryClient.getQueryData<Category[]>(
                categoryKeys.lists()
            );
            return categories?.find((category) => category.id === id);
        },
    });
}
