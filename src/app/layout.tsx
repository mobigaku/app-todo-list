import { AuthProvider } from "@/src/providers/auth-provider";
import { QueryProvider } from "@/src/providers/query-provider";
import { ReduxProvider } from "@/src/providers/redux-provider";
import { ThemeProvider } from "@/src/providers/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TaskMaster - Gerenciador de Tarefas",
    description: "Organize suas tarefas de forma eficiente com o TaskMaster",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body className={inter.className} suppressHydrationWarning>
                <AuthProvider>
                    <ReduxProvider>
                        <QueryProvider>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <div className="space-y-8 flex flex-col items-center justify-center w-full">
                                    {children}
                                </div>
                                <Toaster
                                    richColors
                                    closeButton
                                    position="top-right"
                                />
                            </ThemeProvider>
                        </QueryProvider>
                    </ReduxProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
