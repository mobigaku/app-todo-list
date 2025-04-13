import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory as createCategoryApi } from "@/lib/api";
import { toast } from "sonner";

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { mutateAsync: createCategory } = useMutation({
    mutationFn: (name: string) => createCategoryApi(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      console.error("Failed to create category:", error);
      toast.error("Failed to create category");
    },
  });

  return {
    categories,
    createCategory,
  };
} 