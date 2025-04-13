"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCategoryMutations } from "@/hooks/useCategories";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "O nome da categoria é obrigatório")
    .max(50, "O nome da categoria não pode ter mais de 50 caracteres")
    .refine((value) => /^[a-zA-ZÀ-ÿ0-9\s\-_]+$/.test(value), {
      message: "O nome da categoria só pode conter letras, números, espaços, hífens e underscores",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryModalProps {
  children: React.ReactNode;
}

export function CategoryModal({ children }: CategoryModalProps) {
  const [open, setOpen] = useState(false);
  const { createCategory, isCreating } = useCategoryMutations();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createCategory(data.name);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Adicione uma nova categoria para organizar suas tarefas.
          </DialogDescription>
        </DialogHeader>
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
                      placeholder="Digite o nome da categoria" 
                      {...field}
                      disabled={isCreating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}