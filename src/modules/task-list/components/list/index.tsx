"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TaskSkeleton } from "@/components/ui/skeletons/task-skeleton";
import { useTasks } from "@/hooks/use-tasks";
import { Priority, Status } from "@/types/prisma";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { TaskCard } from "../task-card";

interface TaskListProps {
    categoryId?: string;
    sortField: "name" | "createdAt" | "endDate" | "priority" | "status";
    sortOrder: "asc" | "desc";
    statusFilter: Status | undefined;
    priorityFilter: Priority | undefined;
}

const ITEMS_PER_PAGE = 10;

function TaskListContent({
    categoryId,
    sortField,
    sortOrder,
    statusFilter,
    priorityFilter,
}: TaskListProps) {
    const [page, setPage] = useState(1);
    const {
        tasks = [],
        isLoading,
        pagination,
    } = useTasks({
        categoryId,
        sortBy: sortField,
        sortOrder,
        searchQuery: {
            priority: priorityFilter,
            status: statusFilter,
        },
        page,
        limit: ITEMS_PER_PAGE,
    });

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false,
    });

    if (inView && pagination?.hasMore && !isLoading.query) {
        setPage((prev) => prev + 1);
    }

    if (isLoading.query && tasks.length === 0) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <TaskSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (!isLoading.query && tasks.length === 0) {
        return (
            <EmptyState
                title="Nenhuma tarefa encontrada"
                description="Comece criando uma nova tarefa"
            />
        );
    }

    return (
        <div className="space-y-4 w-full max-w-full lg:max-w-2/3">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} isLoading={isLoading} />
            ))}
            {pagination?.hasMore && (
                <div ref={loadMoreRef} className="py-4">
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <TaskSkeleton key={index} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TaskList(props: TaskListProps) {
    return (
        <ErrorBoundary>
            <TaskListContent {...props} />
        </ErrorBoundary>
    );
}
