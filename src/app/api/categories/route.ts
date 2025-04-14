import { authOptions, getCurrentUser } from "@/src/lib/auth";
import prisma from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createCategorySchema = z.object({
    name: z.string().min(1, "O nome da categoria é obrigatório"),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "name";
        const sortOrder = (searchParams.get("sortOrder") || "asc") as
            | "asc"
            | "desc";

        const categories = await prisma.category.findMany({
            where: {
                userId: session.user.id,
                ...(search && {
                    name: {
                        contains: search,
                    },
                }),
            },
            include: {
                _count: {
                    select: {
                        tasks: true,
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validatedData = createCategorySchema.parse(body);

        const category = await prisma.category.create({
            data: {
                name: validatedData.name,
                userId: user.id,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        console.log(error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        console.error("[CATEGORIES_POST]", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}
