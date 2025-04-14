"use client";

import { getUserFriendlyErrorMessage } from "@/lib/error-handling";
import React from "react";
import { Button } from "./button";

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to an error reporting service
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-4 space-y-4 text-center">
                    <h2 className="text-lg font-semibold text-destructive">
                        Ops! Algo deu errado
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {getUserFriendlyErrorMessage(this.state.error)}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                    >
                        Tentar novamente
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

// HOC to wrap components with ErrorBoundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}
