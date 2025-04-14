import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { createCategory } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
    onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const { mutate } = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            form.reset();
            toast.success("Categoria criada com sucesso!");
            onSuccess?.();
        },
        onError: (error: Error) => {
            console.log(error);
            if (
                error.message.includes("401") ||
                error.message.includes("Não autorizado")
            ) {
                toast.error(
                    "Você precisa estar logado para criar uma categoria"
                );
                router.push("/login");
            } else {
                toast.error("Erro ao criar categoria");
            }
        },
    });

    async function onSubmit(data: FormValues) {
        setIsLoading(true);
        try {
            await mutate(data);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Digite o nome da categoria"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Criando..." : "Criar Categoria"}
                </Button>
            </form>
        </Form>
    );
}
