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
import {
    AlertTriangle,
    CalendarIcon,
    CheckCircle2,
    CircleDot,
    Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    ControllerFieldState,
    ControllerRenderProps,
    useForm,
    UseFormStateReturn,
} from "react-hook-form";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";

const priorityConfig = {
    LOW: {
        label: "Baixa",
        icon: CircleDot,
        color: "text-blue-500",
        bgColor: "bg-blue-50 dark:bg-blue-950",
        borderColor: "border-blue-200 dark:border-blue-800",
    },
    MEDIUM: {
        label: "Média",
        icon: CheckCircle2,
        color: "text-green-500",
        bgColor: "bg-green-50 dark:bg-green-950",
        borderColor: "border-green-200 dark:border-green-800",
    },
    HIGH: {
        label: "Alta",
        icon: Flame,
        color: "text-orange-500",
        bgColor: "bg-orange-50 dark:bg-orange-950",
        borderColor: "border-orange-200 dark:border-orange-800",
    },
    MAXIMUM: {
        label: "Máxima",
        icon: AlertTriangle,
        color: "text-red-500",
        bgColor: "bg-red-50 dark:bg-red-950",
        borderColor: "border-red-200 dark:border-red-800",
    },
} as const;

interface PriorityCardProps {
    priority: keyof typeof priorityConfig;
    selected: boolean;
    onClick: () => void;
}

function PriorityCard({ priority, selected, onClick }: PriorityCardProps) {
    const config = priorityConfig[priority];
    const Icon = config.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200 gap-2",
                config.bgColor,
                config.borderColor,
                selected
                    ? "ring-2 ring-offset-2 ring-primary"
                    : "hover:scale-105",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            )}
        >
            <Icon className={cn("w-6 h-6", config.color)} />
            <span className={cn("font-medium", config.color)}>
                {config.label}
            </span>
        </button>
    );
}

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().nullable().optional(),
    startDate: z.date(),
    endDate: z.date().nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "MAXIMUM"] as const),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"] as const),
    categoryId: z
        .string({ required_error: "Categoria é obrigatória" })
        .min(1, "Categoria é obrigatória"),
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }: FieldProps<"name">) => (
                            <FormItem>
                                <FormLabel>Nome</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Digite o nome da tarefa"
                                        className="w-full"
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
                                        placeholder="Descreva os detalhes da tarefa"
                                        className="min-h-[100px]"
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }: FieldProps<"priority">) => (
                            <FormItem>
                                <FormLabel>Prioridade</FormLabel>
                                <FormControl>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {(
                                            Object.keys(
                                                priorityConfig
                                            ) as Array<
                                                keyof typeof priorityConfig
                                            >
                                        ).map((priority) => (
                                            <PriorityCard
                                                key={priority}
                                                priority={priority}
                                                selected={
                                                    field.value === priority
                                                }
                                                onClick={() =>
                                                    field.onChange(priority)
                                                }
                                            />
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className=" flex lg:flex-row flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }: FieldProps<"categoryId">) => (
                            <FormItem className="w-full">
                                <FormLabel>Categoria</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
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

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }: FieldProps<"status">) => (
                            <FormItem className="w-full">
                                <FormLabel>Status</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
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
                </div>

                <Separator className="my-6" />

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

                <Button type="submit" className="w-full mt-6">
                    {task ? "Atualizar Tarefa" : "Criar Tarefa"}
                </Button>
            </form>
        </Form>
    );
}
