import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { getCategories } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CategoryForm } from "@/src/components/category-form";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Category } from "@/types/prisma";
import { useQuery } from "@tanstack/react-query";
import { Folder, ListTodo, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface SidebarProps {
    className?: string;
}

const allCategories = {
    id: "all",
    name: "Todas as Categorias",
};

export function Sidebar({ className }: SidebarProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold">
                        Navegação
                    </h2>
                    <div className="space-y-1">
                        <Button
                            variant={pathname === "/" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => router.push("/")}
                        >
                            <ListTodo className="mr-2 h-4 w-4" />
                            Todas as Tarefas
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-2 px-4">
                        <h2 className="text-lg font-semibold">Categorias</h2>
                        {session?.user && (
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            Nova Categoria
                                        </DialogTitle>
                                    </DialogHeader>
                                    <CategoryForm
                                        onSuccess={() => setOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                    <ScrollArea className="h-[300px] px-1">
                        <div className="space-y-1">
                            {[allCategories, ...categories].map(
                                (category: Category) => (
                                    <Button
                                        key={category.id}
                                        variant={
                                            pathname ===
                                            `/category/${category.id}`
                                                ? "secondary"
                                                : "ghost"
                                        }
                                        className="w-full justify-start"
                                        onClick={() =>
                                            router.push(
                                                `/category/${category.id}`
                                            )
                                        }
                                    >
                                        <Folder className="mr-2 h-4 w-4" />
                                        {category.name}
                                    </Button>
                                )
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
