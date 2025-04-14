"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/use-tasks";
import { Priority, Status } from "@/types/prisma";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import TaskList from "./components/list";
import { SORT_FIELD_LABELS } from "./constants";
import { SortField, SortOrder } from "./types";

const quickFilters = [
    { label: "Todas", status: undefined },
    { label: "Ativas", status: "IN_PROGRESS" as Status },
    { label: "Pendentes", status: "PENDING" as Status },
    { label: "Concluídas", status: "COMPLETED" as Status },
    { label: "Canceladas", status: "CANCELLED" as Status },
];

export default function TaskListPage({ categoryId }: { categoryId?: string }) {
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [statusFilter, setStatusFilter] = useState<Status | undefined>(
        undefined
    );
    const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(
        undefined
    );
    const [activeTab, setActiveTab] = useState<string>("all");

    // Get all tasks to calculate counts
    const { tasks: allTasks = [], isLoading } = useTasks({
        categoryId,
        limit: 1000, // Get a large number of tasks for accurate counts
    });

    // Calculate task counts for each status
    const taskCounts = useMemo(
        () => ({
            all: allTasks.length,
            PENDING: allTasks.filter((task) => task.status === "PENDING")
                .length,
            IN_PROGRESS: allTasks.filter(
                (task) => task.status === "IN_PROGRESS"
            ).length,
            COMPLETED: allTasks.filter((task) => task.status === "COMPLETED")
                .length,
            CANCELLED: allTasks.filter((task) => task.status === "CANCELLED")
                .length,
        }),
        [allTasks]
    );

    const handleTabChange = useCallback((value: string) => {
        setActiveTab(value);
        if (value === "all") {
            setStatusFilter(undefined);
        } else {
            setStatusFilter(value as Status);
        }
    }, []);

    const handleQuickFilter = useCallback((status: Status | undefined) => {
        setStatusFilter(status);
        setActiveTab(status || "all");
    }, []);

    const handlePriorityChange = useCallback((value: "all" | Priority) => {
        if (value === "all") {
            setPriorityFilter(undefined);
        } else {
            setPriorityFilter(value);
        }
    }, []);

    const handleSortFieldChange = useCallback((value: SortField) => {
        setSortField(value);
    }, []);

    const handleSortOrderChange = useCallback(() => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    }, []);

    return (
        <div className="flex flex-col items-start justify-start w-full gap-4">
            <h1 className="text-3xl font-bold">Suas Tarefas</h1>

            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
            >
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="all" className="flex gap-2">
                        Todas
                        <Badge variant="secondary">{taskCounts.all}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="PENDING" className="flex gap-2">
                        Pendentes
                        <Badge variant="secondary">{taskCounts.PENDING}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="IN_PROGRESS" className="flex gap-2">
                        Em Andamento
                        <Badge variant="secondary">
                            {taskCounts.IN_PROGRESS}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="COMPLETED" className="flex gap-2">
                        Concluídas
                        <Badge variant="secondary">
                            {taskCounts.COMPLETED}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="CANCELLED" className="flex gap-2">
                        Canceladas
                        <Badge variant="secondary">
                            {taskCounts.CANCELLED}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <div className="space-y-4 w-full flex flex-col items-start justify-between gap-4 mt-4">
                    <div className="flex gap-4 flex-wrap justify-between w-full">
                        <div className="flex gap-2 flex-wrap">
                            {quickFilters.map((filter) => (
                                <Button
                                    key={filter.status || "all"}
                                    variant={
                                        statusFilter === filter.status
                                            ? "default"
                                            : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleQuickFilter(filter.status)
                                    }
                                >
                                    {filter.label}
                                </Button>
                            ))}
                        </div>

                        <div className="flex gap-4 flex-wrap">
                            <Select
                                value={priorityFilter}
                                onValueChange={handlePriorityChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por prioridade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todas as prioridades
                                    </SelectItem>
                                    <SelectItem value="LOW">Baixa</SelectItem>
                                    <SelectItem value="MEDIUM">
                                        Média
                                    </SelectItem>
                                    <SelectItem value="HIGH">Alta</SelectItem>
                                    <SelectItem value="MAXIMUM">
                                        Máxima
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex flex-row justify-between">
                                <Select
                                    value={sortField}
                                    onValueChange={handleSortFieldChange}
                                >
                                    <SelectTrigger className="w-[180px] border-r-0 rounded-r-none">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SORT_FIELD_LABELS).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>

                                <div className="bg-input/30 flex gap-2 items-center border-1 border-input px-2 rounded-lg rounded-l-none cursor-pointer">
                                    {sortOrder === "asc" ? (
                                        <span onClick={handleSortOrderChange}>
                                            <ArrowUpIcon className="h-4 w-4" />
                                        </span>
                                    ) : (
                                        <span onClick={handleSortOrderChange}>
                                            <ArrowDownIcon className="h-4 w-4" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {isLoading.query ? (
                                    <div className="flex gap-2">
                                        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                                        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                                        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                                        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            variant={
                                                !statusFilter
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handleQuickFilter(undefined)
                                            }
                                        >
                                            Todas ({taskCounts.all})
                                        </Button>
                                        <Button
                                            variant={
                                                statusFilter === "PENDING"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handleQuickFilter("PENDING")
                                            }
                                        >
                                            Pendentes ({taskCounts.PENDING})
                                        </Button>
                                        <Button
                                            variant={
                                                statusFilter === "IN_PROGRESS"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handleQuickFilter("IN_PROGRESS")
                                            }
                                        >
                                            Em Progresso (
                                            {taskCounts.IN_PROGRESS})
                                        </Button>
                                        <Button
                                            variant={
                                                statusFilter === "COMPLETED"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handleQuickFilter("COMPLETED")
                                            }
                                        >
                                            Concluídas ({taskCounts.COMPLETED})
                                        </Button>
                                        <Button
                                            variant={
                                                statusFilter === "CANCELLED"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                handleQuickFilter("CANCELLED")
                                            }
                                        >
                                            Canceladas ({taskCounts.CANCELLED})
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <TaskList
                        categoryId={categoryId}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        statusFilter={statusFilter}
                        priorityFilter={priorityFilter}
                    />
                </div>
            </Tabs>
        </div>
    );
}
