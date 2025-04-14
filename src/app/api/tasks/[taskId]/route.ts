import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validations/task";
import { Status } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { taskId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const task = await prisma.task.findUnique({
            where: {
                id: params.taskId,
                userId: session.user.id,
            },
            include: { category: true },
        });

        if (!task) {
            return NextResponse.json(
                { error: "Tarefa não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_GET]", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { taskId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const result = updateTaskSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Nome da tarefa é obrigatório" },
                { status: 400 }
            );
        }

        // First check if task exists
        const existingTask = await prisma.task.findUnique({
            where: {
                id: params.taskId,
                userId: session.user.id,
            },
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: "Tarefa não encontrada" },
                { status: 404 }
            );
        }

        try {
            const task = await prisma.task.update({
                where: {
                    id: params.taskId,
                    userId: session.user.id,
                },
                data: {
                    name: result.data.name,
                    description: result.data.description,
                    startDate: new Date(result.data.startDate),
                    endDate: result.data.endDate
                        ? new Date(result.data.endDate)
                        : null,
                    priority: result.data.priority,
                    status: result.data.status as Status,
                    categoryId: result.data.categoryId || undefined,
                },
            });

            return NextResponse.json(task);
        } catch (updateError) {
            console.error("[TASK_PATCH] Database error:", updateError);
            return NextResponse.json(
                { error: "Erro interno do servidor" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[TASK_PATCH]", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { taskId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        // First check if task exists
        const existingTask = await prisma.task.findUnique({
            where: {
                id: params.taskId,
                userId: session.user.id,
            },
        });

        if (!existingTask) {
            return NextResponse.json(
                { error: "Tarefa não encontrada" },
                { status: 404 }
            );
        }

        try {
            const task = await prisma.task.delete({
                where: {
                    id: params.taskId,
                    userId: session.user.id,
                },
            });

            return NextResponse.json(task);
        } catch (deleteError) {
            console.error("[TASK_DELETE] Database error:", deleteError);
            return NextResponse.json(
                { error: "Erro interno do servidor" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("[TASK_DELETE]", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
