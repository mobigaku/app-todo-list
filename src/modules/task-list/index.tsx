"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Priority, Status } from "@/types/prisma";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";
import TaskList from "./components/list";
import { SortField, SortOrder } from "./types";
import { sortFieldLabels } from "./utils";

export default function TaskListPage({ categoryId }: { categoryId?: string }) {
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [statusFilter, setStatusFilter] = useState<Status | undefined>(
        undefined
    );
    const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(
        undefined
    );

    return (
        <div className="flex flex-col items-start justify-start w-full gap-4">
            <h1 className="text-3xl font-bold">Suas Tarefas</h1>
            <div className="space-y-4 w-full flex flex-col items-start justify-between gap-4">
                <div className="flex gap-4 flex-wrap justify-between w-full">
                    <div className="flex gap-4 flex-row justify-between">
                        <Select
                            value={statusFilter}
                            onValueChange={(value: "all" | Status) => {
                                if (value === "all") {
                                    setStatusFilter(undefined);
                                } else {
                                    setStatusFilter(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos os status
                                </SelectItem>
                                <SelectItem value="PENDING">
                                    Não Iniciada
                                </SelectItem>
                                <SelectItem value="IN_PROGRESS">
                                    Em Andamento
                                </SelectItem>
                                <SelectItem value="COMPLETED">
                                    Concluída
                                </SelectItem>
                                <SelectItem value="CANCELLED">
                                    Cancelada
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={priorityFilter}
                            onValueChange={(value: "all" | Priority) => {
                                if (value === "all") {
                                    setPriorityFilter(undefined);
                                } else {
                                    setPriorityFilter(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filtrar por prioridade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todas as prioridades
                                </SelectItem>
                                <SelectItem value="LOW">Baixa</SelectItem>
                                <SelectItem value="MEDIUM">Média</SelectItem>
                                <SelectItem value="HIGH">Alta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-row justify-between">
                        <Select
                            value={sortField}
                            onValueChange={(value: SortField) => {
                                setSortField(value);
                            }}
                        >
                            <SelectTrigger className="w-[180px] border-r-0 rounded-r-none">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(sortFieldLabels).map(
                                    ([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    )
                                )}
                            </SelectContent>
                        </Select>

                        <div className="bg-input/30 flex gap-2 items-center border-1 border-input px-2 rounded-lg  rounded-l-none">
                            {sortOrder === "asc" && (
                                <span onClick={() => setSortOrder("desc")}>
                                    <ArrowUpIcon className="h-4 w-4" />
                                </span>
                            )}
                            {sortOrder === "desc" && (
                                <span onClick={() => setSortOrder("asc")}>
                                    <ArrowDownIcon className="h-4 w-4" />
                                </span>
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
        </div>
    );
}
