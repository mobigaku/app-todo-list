export interface Category {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
}

export interface CategoryInput {
    name: string;
    description?: string;
}
