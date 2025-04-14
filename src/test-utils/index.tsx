import { store } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render as rtlRender } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";

// Create a custom render function that includes providers
function render(ui: React.ReactElement, { ...renderOptions } = {}) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </Provider>
        );
    }

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
