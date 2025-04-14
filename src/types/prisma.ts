export type Priority = "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";

export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Category {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    tasks?: Task[];
}

export interface Task {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    priority: Priority;
    status: Status;
    categoryId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
