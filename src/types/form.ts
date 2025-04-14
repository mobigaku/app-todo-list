export type TaskFormValues = {
    name: string;
    description?: string | null;
    startDate: Date;
    endDate?: Date | null;
    priority: "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    categoryId: string;
};
