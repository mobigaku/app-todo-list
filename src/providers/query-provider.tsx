"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
    getUserFriendlyErrorMessage,
    retryConfig,
    shouldRetry,
} from "@/lib/error-handling";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { toast } from "sonner";

// Shared retry configuration for both queries and mutations
const retryOptions = {
    retry: (failureCount: number, error: unknown) => {
        if (!shouldRetry(error)) {
            return false;
        }
        return failureCount < retryConfig.maxRetries;
    },
    retryDelay: (attemptIndex: number) => {
        return Math.min(
            retryConfig.initialRetryDelay *
                Math.pow(retryConfig.backoffFactor, attemptIndex),
            retryConfig.maxRetryDelay
        );
    },
};

// Error handler function
const handleError = (error: unknown) => {
    toast.error(getUserFriendlyErrorMessage(error));
};

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // Data stays fresh for 1 minute
                gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
                refetchOnWindowFocus: false,
                ...retryOptions,
            },
            mutations: {
                ...retryOptions,
                onError: handleError,
            },
        },
    });

    const errorFallback = (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4 space-y-4 text-center">
            <h2 className="text-lg font-semibold text-destructive">
                Erro ao carregar dados
            </h2>
            <p className="text-sm text-muted-foreground">
                Ocorreu um erro ao carregar os dados. Por favor, tente
                novamente.
            </p>
        </div>
    );

    return (
        <ErrorBoundary fallback={errorFallback}>
            <Suspense
                fallback={
                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                }
            >
                <QueryClientProvider client={queryClient}>
                    {children}
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </Suspense>
        </ErrorBoundary>
    );
}
