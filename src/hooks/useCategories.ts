import { Category } from "@/types/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CategoryWithTaskCount extends Category {
    _count: {
        tasks: number;
    };
}

interface CategoryFilters {
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

async function getCategories(
    filters: CategoryFilters = {}
): Promise<CategoryWithTaskCount[]> {
    const searchParams = new URLSearchParams();

    if (filters.search) {
        searchParams.set("search", filters.search);
    }
    if (filters.sortBy) {
        searchParams.set("sortBy", filters.sortBy);
    }
    if (filters.sortOrder) {
        searchParams.set("sortOrder", filters.sortOrder);
    }

    const queryString = searchParams.toString();
    const url = `/api/categories${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao carregar categorias");
    }
    return response.json();
}

async function createCategory(name: string): Promise<Category> {
    const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar categoria");
    }
    return response.json();
}

async function deleteCategoryRequest(id: string): Promise<void> {
    const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao excluir categoria");
    }
}

export function useCategories(filters: CategoryFilters = {}) {
    return useQuery<CategoryWithTaskCount[]>({
        queryKey: ["categories", filters],
        queryFn: () => getCategories(filters),
    });
}

export function useCategoryMutations() {
    const queryClient = useQueryClient();

    const { mutateAsync: createCategoryMutation, isPending: isCreating } =
        useMutation({
            mutationFn: createCategory,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["categories"] });
                toast.success("Categoria criada com sucesso!");
            },
            onError: (error: Error) => {
                toast.error(error.message);
            },
        });

    const { mutateAsync: deleteCategory, isPending: isDeleting } = useMutation({
        mutationFn: deleteCategoryRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Categoria excluída com sucesso");
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });

    return {
        createCategory: createCategoryMutation,
        isCreating,
        deleteCategory,
        isDeleting,
    };
}
