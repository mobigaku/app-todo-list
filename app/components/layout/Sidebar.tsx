import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCategories } from "@/lib/api";
import { Folder, ListTodo } from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navegação</h2>
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
          <h2 className="mb-2 px-4 text-lg font-semibold">Categorias</h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1">
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={pathname === `/category/${category.id}` ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => router.push(`/category/${category.id}`)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 