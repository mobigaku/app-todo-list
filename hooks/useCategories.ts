import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Category } from "@/types/prisma";
import { createCategory as createCategoryApi } from "@/lib/api";

interface CategoryWithTaskCount extends Category {
  _count: {
    tasks: number;
  };
}

async function getCategories(): Promise<CategoryWithTaskCount[]> {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao carregar categorias");
  }
  return response.json();
}

async function deleteCategory(id: string): Promise<void> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Erro ao excluir categoria");
  }
}

export function useCategories() {
  return useQuery<CategoryWithTaskCount[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
    mutationFn: createCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar categoria");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria excluída com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createCategory,
    isCreating,
    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
} 