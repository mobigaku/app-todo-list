"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/app/lib/api";

type SortField = "name" | "endDate" | "priority" | "status";
type SortOrder = "asc" | "desc";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "MAXIMUM";
type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

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

const priorityOrder: Record<Priority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  MAXIMUM: 3,
};

interface TaskListProps {
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, status: Status) => void;
}

export function TaskList({ onEdit, onDelete }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const { data: tasks, isLoading, error } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const sortTasks = (a: Task, b: Task) => {
    if (sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortField === "endDate") {
      if (!a.endDate) return sortOrder === "asc" ? 1 : -1;
      if (!b.endDate) return sortOrder === "asc" ? -1 : 1;
      return sortOrder === "asc"
        ? new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        : new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
    }
    if (sortField === "priority") {
      return sortOrder === "asc"
        ? priorityOrder[a.priority as Priority] - priorityOrder[b.priority as Priority]
        : priorityOrder[b.priority as Priority] - priorityOrder[a.priority as Priority];
    }
    if (sortField === "status") {
      return sortOrder === "asc"
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  };

  const filterTasks = (task: Task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    return true;
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando tarefas...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-destructive">Erro ao carregar tarefas. Tente novamente.</div>;
  }

  const filteredTasks = (tasks || []).filter(filterTasks).sort(sortTasks);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | Status) => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="PENDING">Não Iniciada</SelectItem>
            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
            <SelectItem value="COMPLETED">Concluída</SelectItem>
            <SelectItem value="CANCELLED">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={priorityFilter}
          onValueChange={(value: "all" | Priority) => setPriorityFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as prioridades</SelectItem>
            <SelectItem value="LOW">Baixa</SelectItem>
            <SelectItem value="MEDIUM">Média</SelectItem>
            <SelectItem value="HIGH">Alta</SelectItem>
            <SelectItem value="MAXIMUM">Máxima</SelectItem>
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
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task: Task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.name}</TableCell>
                  <TableCell>
                    {task.endDate
                      ? format(new Date(task.endDate), "PPP", { locale: ptBR })
                      : "Não definida"}
                  </TableCell>
                  <TableCell>{priorityLabels[task.priority as Priority]}</TableCell>
                  <TableCell>{statusLabels[task.status as Status]}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Visualizar"
                      onClick={() => onEdit?.(task)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Editar"
                      onClick={() => onEdit?.(task)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Excluir"
                      onClick={() => onDelete?.(task)}
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