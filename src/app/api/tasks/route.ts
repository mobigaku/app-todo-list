import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Priority, Status } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const searchParamsSchema = z.object({
    categoryId: z.string().optional(),
    sortBy: z
        .enum(["name", "createdAt", "endDate", "priority", "status"])
        .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    priority: z.nativeEnum(Priority).optional(),
    status: z.nativeEnum(Status).optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(10000).optional(),
});

const createTaskSchema = z.object({
    name: z.string().min(1, "O nome da tarefa é obrigatório"),
    description: z.string().optional(),
    status: z.nativeEnum(Status),
    priority: z.nativeEnum(Priority),
    categoryId: z.string().min(1, "A categoria é obrigatória"),
    startDate: z.date().default(() => new Date()),
    endDate: z.date().optional().nullable(),
});

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const searchParams = Object.fromEntries(request.nextUrl.searchParams);
        console.log({ searchParams });
        const validatedParams = searchParamsSchema.parse({
            ...searchParams,
            limit: searchParams.limit ? parseInt(searchParams.limit) : 10,
            page: searchParams.page ? parseInt(searchParams.page) : 1,
        });

        const {
            categoryId,
            sortBy = "createdAt",
            sortOrder = "desc",
            priority,
            status,
            page = 1,
            limit = 10,
        } = validatedParams;

        const where = {
            userId: user.id,
            ...(categoryId && { categoryId }),
            ...(priority && { priority }),
            ...(status && { status }),
        };

        const [total, tasks] = await Promise.all([
            prisma.task.count({ where }),
            prisma.task.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        return NextResponse.json({
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasMore,
            },
        });
    } catch (error) {
        console.error("[TASKS_GET]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        try {
            const rawData = {
                ...body,
                startDate: body.startDate
                    ? new Date(body.startDate)
                    : new Date(),
                endDate: body.endDate ? new Date(body.endDate) : null,
            };
            const validatedData = createTaskSchema.parse(rawData);

            const task = await prisma.task.create({
                data: {
                    ...validatedData,
                    userId: user.id,
                },
            });

            return NextResponse.json(task, { status: 200 });
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                return NextResponse.json(
                    { error: "Dados inválidos" },
                    { status: 400 }
                );
            }
            throw validationError;
        }
    } catch (error) {
        console.error("[TASKS_POST]", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
