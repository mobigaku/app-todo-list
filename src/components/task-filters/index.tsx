"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { useFilters } from "@/src/hooks/use-filters";
import { Category, Priority, Status } from "@/src/types/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";

export function TaskFilters() {
    const {
        filters,
        setStatus,
        setPriority,
        setDateRange,
        setSearch,
        setCategory,
        clear,
    } = useFilters();
    const { data: categories = [] } = useCategories();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder="Pesquisar tarefas..."
                    value={filters.search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => clear()}
                    title="Limpar filtros"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-wrap gap-4">
                <Select
                    value={filters.status}
                    onValueChange={(value: Status | "all") => setStatus(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="PENDING">Não Iniciada</SelectItem>
                        <SelectItem value="IN_PROGRESS">
                            Em Andamento
                        </SelectItem>
                        <SelectItem value="COMPLETED">Concluída</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.priority}
                    onValueChange={(value: Priority | "all") =>
                        setPriority(value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">
                            Todas as prioridades
                        </SelectItem>
                        <SelectItem value="LOW">Baixa</SelectItem>
                        <SelectItem value="MEDIUM">Média</SelectItem>
                        <SelectItem value="HIGH">Alta</SelectItem>
                        <SelectItem value="MAXIMUM">Máxima</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.categoryId}
                    onValueChange={(value: string) => setCategory(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[180px] justify-start text-left font-normal",
                                    !filters.dateRange.startDate &&
                                        "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.startDate ? (
                                    format(
                                        new Date(filters.dateRange.startDate),
                                        "PPP",
                                        {
                                            locale: ptBR,
                                        }
                                    )
                                ) : (
                                    <span>Data inicial</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={
                                    filters.dateRange.startDate
                                        ? new Date(filters.dateRange.startDate)
                                        : undefined
                                }
                                onSelect={(date) =>
                                    setDateRange({
                                        ...filters.dateRange,
                                        startDate: date?.toISOString() || null,
                                    })
                                }
                                initialFocus
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-[180px] justify-start text-left font-normal",
                                    !filters.dateRange.endDate &&
                                        "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {filters.dateRange.endDate ? (
                                    format(
                                        new Date(filters.dateRange.endDate),
                                        "PPP",
                                        {
                                            locale: ptBR,
                                        }
                                    )
                                ) : (
                                    <span>Data final</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={
                                    filters.dateRange.endDate
                                        ? new Date(filters.dateRange.endDate)
                                        : undefined
                                }
                                onSelect={(date) =>
                                    setDateRange({
                                        ...filters.dateRange,
                                        endDate: date?.toISOString() || null,
                                    })
                                }
                                initialFocus
                                locale={ptBR}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
