import { ClipboardList } from "lucide-react";

interface EmptyStateProps {
    title: string;
    description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 py-8 border rounded-md">
            <ClipboardList className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
