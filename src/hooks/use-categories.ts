import {
    errorMessages,
    getUserFriendlyErrorMessage,
    handleAPIResponse,
} from "@/lib/error-handling";
import { CategoryInput } from "@/types/category";
import { Category } from "@/types/prisma";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query key factory for better type safety and consistency
const categoryKeys = {
    all: ["categories"] as const,
    lists: () => [...categoryKeys.all, "list"] as const,
    details: () => [...categoryKeys.all, "detail"] as const,
    detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategories() {
    const queryClient = useQueryClient();

    // Helper function to prefetch categories
    const prefetchCategories = async () => {
        await queryClient.prefetchQuery({
            queryKey: categoryKeys.lists(),
            queryFn: async () => {
                const response = await fetch("/api/categories");
                return handleAPIResponse<Category[]>(response);
            },
        });
    };

    const { data: categories = [], isLoading } = useQuery({
        queryKey: categoryKeys.lists(),
        queryFn: async () => {
            const response = await fetch("/api/categories");
            return handleAPIResponse<Category[]>(response);
        },
        staleTime: 30 * 1000, // Consider data fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
    });

    const { mutate: createCategory, isPending: isCreating } = useMutation({
        mutationFn: async (data: CategoryInput) => {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return handleAPIResponse<Category>(response);
        },
        onMutate: async (newCategory) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: categoryKeys.lists(),
            });

            // Snapshot the previous value
            const previousCategories = queryClient.getQueryData<Category[]>(
                categoryKeys.lists()
            );

            // Optimistically update to the new value
            const optimisticCategory: Category = {
                id: `temp-${Date.now()}`,
                userId: "",
                ...newCategory,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            queryClient.setQueryData<Category[]>(
                categoryKeys.lists(),
                (old = []) => [...old, optimisticCategory]
            );

            // Return a context object with the snapshotted value
            return { previousCategories };
        },
        onError: (error, newCategory, context) => {
            if (context?.previousCategories) {
                // Rollback to the previous value if there was an error
                queryClient.setQueryData(
                    categoryKeys.lists(),
                    context.previousCategories
                );
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: categoryKeys.lists(),
            });
            toast.success(errorMessages.CATEGORY_CREATE_SUCCESS);
        },
    });

    const { mutate: updateCategory, isPending: isUpdating } = useMutation({
        mutationFn: async ({
            categoryId,
            data,
        }: {
            categoryId: string;
            data: Partial<CategoryInput>;
        }) => {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return handleAPIResponse<Category>(response);
        },
        onMutate: async ({ categoryId, data }) => {
            await queryClient.cancelQueries({
                queryKey: categoryKeys.lists(),
            });

            // Snapshot the previous value
            const previousCategories = queryClient.getQueryData<Category[]>(
                categoryKeys.lists()
            );

            // Optimistically update to the new value
            queryClient.setQueryData<Category[]>(
                categoryKeys.lists(),
                (old = []) =>
                    old.map((category) =>
                        category.id === categoryId
                            ? { ...category, ...data, updatedAt: new Date() }
                            : category
                    )
            );

            return { previousCategories };
        },
        onError: (error, variables, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(
                    categoryKeys.lists(),
                    context.previousCategories
                );
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: categoryKeys.lists(),
            });
            toast.success(errorMessages.CATEGORY_UPDATE_SUCCESS);
        },
    });

    const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
        mutationFn: async (categoryId: string) => {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: "DELETE",
            });
            return handleAPIResponse<Category>(response);
        },
        onMutate: async (categoryId) => {
            await queryClient.cancelQueries({
                queryKey: categoryKeys.lists(),
            });

            const previousCategories = queryClient.getQueryData<Category[]>(
                categoryKeys.lists()
            );

            queryClient.setQueryData<Category[]>(
                categoryKeys.lists(),
                (old = []) =>
                    old.filter((category) => category.id !== categoryId)
            );

            return { previousCategories };
        },
        onError: (error, categoryId, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(
                    categoryKeys.lists(),
                    context.previousCategories
                );
            }
            toast.error(getUserFriendlyErrorMessage(error));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: categoryKeys.lists(),
            });
            toast.success(errorMessages.CATEGORY_DELETE_SUCCESS);
        },
    });

    return {
        categories,
        isLoading: {
            query: isLoading,
            create: isCreating,
            update: isUpdating,
            delete: isDeleting,
        },
        createCategory,
        updateCategory,
        deleteCategory,
        prefetchCategories,
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
