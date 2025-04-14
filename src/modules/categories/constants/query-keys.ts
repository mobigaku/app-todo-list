export const CATEGORY_KEYS = {
    all: ["categories"] as const,
    lists: () => [...CATEGORY_KEYS.all, "list"] as const,
    list: () => [...CATEGORY_KEYS.lists()] as const,
    details: () => [...CATEGORY_KEYS.all, "detail"] as const,
    detail: (id: string) => [...CATEGORY_KEYS.details(), id] as const,
} as const;
