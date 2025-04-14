"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Priority, Status } from "@prisma/client";
import { SortField, SortOrder } from "../../task-list/types";
import TaskList from "./list";

interface TaskListWrapperProps {
    categoryId?: string;
    sortField?: SortField;
    sortOrder?: SortOrder;
    statusFilter?: Status;
    priorityFilter?: Priority;
}

export function TaskListWrapper(props: TaskListWrapperProps) {
    return (
        <ErrorBoundary>
            <TaskList
                categoryId={props.categoryId}
                sortField={props.sortField || "name"}
                sortOrder={props.sortOrder || "desc"}
                statusFilter={props.statusFilter}
                priorityFilter={props.priorityFilter}
            />
        </ErrorBoundary>
    );
}
