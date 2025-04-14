"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/hooks/use-tasks";
import { cn } from "@/lib/utils";
import type { TaskFormValues } from "@/src/types/form";
import { Category, Task } from "@/types/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    ControllerFieldState,
    ControllerRenderProps,
    useForm,
    UseFormStateReturn,
} from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().nullable().optional(),
    startDate: z.date(),
    endDate: z.date().nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "MAXIMUM"] as const),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"] as const),
    categoryId: z.string(),
}) satisfies z.ZodType<TaskFormValues>;

interface TaskFormProps {
    task?: Task;
    categories: Category[];
    onSubmit?: (data: TaskFormValues) => Promise<void>;
}

interface FieldProps<T extends keyof TaskFormValues> {
    field: ControllerRenderProps<TaskFormValues, T>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TaskFormValues>;
}

export function TaskForm({
    task,
    categories,
    onSubmit: onSubmitProp,
}: TaskFormProps) {
    const router = useRouter();
    const { createTask } = useTasks();

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: task?.name ?? "",
            description: task?.description ?? null,
            startDate: task?.startDate ? new Date(task.startDate) : new Date(),
            endDate: task?.endDate ? new Date(task.endDate) : null,
            priority: task?.priority ?? "LOW",
            status: task?.status ?? "PENDING",
            categoryId: task?.categoryId ?? categories[0]?.id ?? "",
        },
    });

    async function onSubmit(data: TaskFormValues) {
        try {
            if (onSubmitProp) {
                await onSubmitProp(data);
            } else {
                await createTask(data);
                router.refresh();
            }
            form.reset();
        } catch (error) {
            console.error("Failed to submit task:", error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }: FieldProps<"name">) => (
                        <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nome da tarefa"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }: FieldProps<"description">) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Descrição da tarefa"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }: FieldProps<"priority">) => (
                        <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a prioridade" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }: FieldProps<"status">) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="PENDING">
                                        Não Iniciada
                                    </SelectItem>
                                    <SelectItem value="IN_PROGRESS">
                                        Em Andamento
                                    </SelectItem>
                                    <SelectItem value="COMPLETED">
                                        Concluída
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }: FieldProps<"categoryId">) => (
                        <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }: FieldProps<"startDate">) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Data de Início</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>
                                                        Selecione uma data
                                                    </span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }: FieldProps<"endDate">) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Data de Conclusão</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>
                                                        Selecione uma data
                                                    </span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={field.value ?? undefined}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full">
                    {task ? "Atualizar Tarefa" : "Criar Tarefa"}
                </Button>
            </form>
        </Form>
    );
}
