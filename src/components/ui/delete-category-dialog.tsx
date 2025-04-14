"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useCategoryMutations } from "@/hooks/useCategories";

interface DeleteCategoryDialogProps {
  categoryId: string;
  categoryName: string;
  taskCount: number;
}

export function DeleteCategoryDialog({ categoryId, categoryName, taskCount }: DeleteCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const { deleteCategory, isDeleting } = useCategoryMutations();

  const handleDelete = async () => {
    try {
      await deleteCategory(categoryId);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a categoria &quot;{categoryName}&quot;?
            {taskCount > 0 && (
              <>
                <br />
                <br />
                Esta categoria contém {taskCount} {taskCount === 1 ? "tarefa" : "tarefas"}.
                Todas as tarefas associadas ficarão sem categoria.
              </>
            )}
            <br />
            <br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 