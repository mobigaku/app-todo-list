import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreateTaskButtonProps {
  onClick: () => void;
  className?: string;
}

export function CreateTaskButton({ onClick, className }: CreateTaskButtonProps) {
  const { data: session } = useSession();

  if (!session) return null;

  return (
    <Button
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95",
        "flex items-center justify-center gap-2 bg-primary text-primary-foreground",
        "lg:bottom-8 lg:right-8 lg:h-auto lg:w-auto lg:px-6 lg:py-3",
        className
      )}
      onClick={onClick}
      aria-label="Criar nova tarefa"
    >
      <Plus className="h-6 w-6 lg:h-5 lg:w-5" />
      <span className="hidden lg:inline">Nova Tarefa</span>
    </Button>
  );
} 