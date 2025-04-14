import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { taskId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Não autorizado", { status: 401 });
        }

        const task = await db.task.findUnique({
            where: {
                id: params.taskId,
                userId: session.user.id,
            },
            include: {
                category: true,
            },
        });

        if (!task) {
            return new NextResponse("Tarefa não encontrada", { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_GET]", error);
        return new NextResponse("Erro interno do servidor", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { taskId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Não autorizado", { status: 401 });
        }

        const body = await req.json();
        const {
            name,
            description,
            startDate,
            endDate,
            priority,
            status,
            categoryId,
        } = body;
        console.log({ body });

        if (!name) {
            return new NextResponse("Nome da tarefa é obrigatório", {
                status: 400,
            });
        }

        if (!startDate) {
            return new NextResponse("Data de início é obrigatória", {
                status: 400,
            });
        }

        const task = await db.task.update({
            where: {
                id: params.taskId,
                userId: session.user.id,
            },
            data: {
                name,
                description,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                priority,
                status,
                categoryId,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_PATCH]", error);
        return new NextResponse("Erro interno do servidor", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { taskId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Não autorizado", { status: 401 });
        }

        const task = await db.task.delete({
            where: {
                id: params.taskId,
                userId: session.user.id,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_DELETE]", error);
        return new NextResponse("Erro interno do servidor", { status: 500 });
    }
}
