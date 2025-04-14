import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <Loader2
            className={cn(
                "animate-spin text-muted-foreground",
                sizeClasses[size],
                className
            )}
        />
    );
}

interface LoadingStateProps {
    loading: boolean;
    children: React.ReactNode;
    loadingText?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingState({
    loading,
    children,
    loadingText = "Carregando...",
    size = "md",
    className,
}: LoadingStateProps) {
    if (!loading) {
        return children;
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-2 text-muted-foreground",
                className
            )}
        >
            <Spinner size={size} />
            {loadingText && <span>{loadingText}</span>}
        </div>
    );
}

interface LoadingOverlayProps {
    loading: boolean;
    children: React.ReactNode;
    loadingText?: string;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingOverlay({
    loading,
    children,
    loadingText = "Carregando...",
    size = "md",
    className,
}: LoadingOverlayProps) {
    return (
        <div className="relative">
            {children}
            {loading && (
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm",
                        className
                    )}
                >
                    <div className="flex flex-col items-center gap-2">
                        <Spinner size={size} />
                        {loadingText && (
                            <span className="text-muted-foreground">
                                {loadingText}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
