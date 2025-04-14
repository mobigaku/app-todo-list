"use client";

import { useState } from "react";
import { TaskCreateModal } from "../task-create-modal";
import { CreateTaskButton } from "../ui/create-task-button";
import { Navbar } from "./components/navbar";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background w-full">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <div className="flex">
                {/* Main content */}
                <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>

            <CreateTaskButton onClick={() => setIsTaskModalOpen(true)} />
            <TaskCreateModal
                open={isTaskModalOpen}
                onOpenChange={setIsTaskModalOpen}
            />
        </div>
    );
}
