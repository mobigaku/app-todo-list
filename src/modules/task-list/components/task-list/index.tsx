"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useTasks } from "@/hooks/use-tasks";
import { Priority, Status } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

type SortField = "name" | "endDate" | "priority" | "status";
type SortOrder = "asc" | "desc";

const priorityLabels: Record<Priority, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    MAXIMUM: "Máxima",
};

const statusLabels: Record<Status, string> = {
    PENDING: "Não Iniciada",
    IN_PROGRESS: "Em Andamento",
    COMPLETED: "Concluída",
    CANCELLED: "Cancelada",
};

export function TaskList({ categoryId }: { categoryId?: string }) {
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const [statusFilter, setStatusFilter] = useState<Status | undefined>(
        undefined
    );
    const [priorityFilter, setPriorityFilter] = useState<Priority | undefined>(
        undefined
    );
    const { tasks = [], isLoading } = useTasks({
        categoryId,
        sortBy: sortField,
        sortOrder,
        searchQuery: {
            priority: priorityFilter,
            status: statusFilter,
        },
    });

    const handleSort = (field: SortField) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    if (isLoading) {
        return <div>Carregando tarefas...</div>;
    }

    return (
        <div className="space-y-4 w-full">
            <div className="flex gap-4">
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
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="PENDING">Não Iniciada</SelectItem>
                        <SelectItem value="IN_PROGRESS">
                            Em Andamento
                        </SelectItem>
                        <SelectItem value="COMPLETED">Concluída</SelectItem>
                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("name")}
                                    className="font-bold"
                                >
                                    Nome
                                    {sortField === "name" && (
                                        <span className="ml-1">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("endDate")}
                                    className="font-bold"
                                >
                                    Data de Conclusão
                                    {sortField === "endDate" && (
                                        <span className="ml-1">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("priority")}
                                    className="font-bold"
                                >
                                    Prioridade
                                    {sortField === "priority" && (
                                        <span className="ml-1">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() => handleSort("status")}
                                    className="font-bold"
                                >
                                    Status
                                    {sortField === "status" && (
                                        <span className="ml-1">
                                            {sortOrder === "asc" ? "↑" : "↓"}
                                        </span>
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="text-center py-8"
                                >
                                    Nenhuma tarefa encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.name}</TableCell>
                                    <TableCell>
                                        {task.endDate
                                            ? format(task.endDate, "PPP", {
                                                  locale: ptBR,
                                              })
                                            : "Não definida"}
                                    </TableCell>
                                    <TableCell>
                                        {priorityLabels[task.priority]}
                                    </TableCell>
                                    <TableCell>
                                        {statusLabels[task.status]}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Visualizar"
                                            onClick={() => {}} // Will be implemented in task 6.6
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Editar"
                                            onClick={() => {}} // Will be implemented in task 6.7
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Excluir"
                                            onClick={() => {}} // Will be implemented in task 6.7
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
