"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { retryConfig, shouldRetry } from "@/lib/error-handling";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";

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

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // Data stays fresh for 1 minute
                gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
                refetchOnWindowFocus: true, // Enable automatic background refetching
                refetchOnReconnect: true, // Refetch when reconnecting
                refetchOnMount: true, // Refetch when component mounts
                retry: retryOptions.retry,
                retryDelay: retryOptions.retryDelay,
                networkMode: "online",
                structuralSharing: true,
            },
            mutations: {
                ...retryOptions,
                networkMode: "online",
                retry: 2, // Fewer retries for mutations
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
                    <ReactQueryDevtools
                        initialIsOpen={false}
                        position="right"
                    />
                </QueryClientProvider>
            </Suspense>
        </ErrorBoundary>
    );
}
