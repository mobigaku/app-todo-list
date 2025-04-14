import { Priority, Status } from "@prisma/client";

export interface TaskInput {
    name: string;
    description?: string | null;
    startDate: Date;
    endDate?: Date | null;
    priority: Priority;
    status: Status;
    categoryId: string;
}
