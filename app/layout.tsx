import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";

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
      <body className={inter.className}>
        <AuthProvider>
          <ReduxProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster richColors closeButton position="top-right" />
              </ThemeProvider>
            </QueryProvider>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
