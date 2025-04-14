"use client";

import {
    getUserFriendlyErrorMessage,
    retryConfig,
    shouldRetry,
} from "@/lib/error-handling";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
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

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        refetchOnWindowFocus: false,
                        ...retryOptions,
                        onError: (error: unknown) => {
                            toast.error(getUserFriendlyErrorMessage(error));
                        },
                    },
                    mutations: {
                        ...retryOptions,
                        onError: (error: unknown) => {
                            toast.error(getUserFriendlyErrorMessage(error));
                        },
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
