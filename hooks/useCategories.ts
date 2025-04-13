import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Category } from "@/types/prisma";

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

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
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
    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
} 