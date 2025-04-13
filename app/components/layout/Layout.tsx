"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { CreateTaskButton } from "@/components/ui/create-task-button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        />

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      <CreateTaskButton
        onClick={() => {
          // TODO: Open task creation modal in subtask 5.1
          console.log("Open task creation modal");
        }}
      />
    </div>
  );
} 