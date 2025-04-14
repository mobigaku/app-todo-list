import { authOptions } from "@/lib/auth";
import { errorMessages, retryConfig } from "@/lib/error-handling";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession, Session } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createCategorySchema = z.object({
    name: z.string().min(1, "O nome da categoria é obrigatório"),
});

// Helper function to retry database operations
async function retryOperation<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    let delay = retryConfig.initialRetryDelay;

    for (let attempt = 0; attempt < retryConfig.maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry if it's a client error (e.g., validation error)
            if (error && typeof error === "object" && "code" in error) {
                const prismaError = error as { code: string };
                if (["P2002", "P2025", "P2003"].includes(prismaError.code)) {
                    throw error;
                }
            }

            // If it's the last attempt, throw the error
            if (attempt === retryConfig.maxRetries - 1) {
                throw error;
            }

            // Wait before retrying with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay = Math.min(
                delay * retryConfig.backoffFactor,
                retryConfig.maxRetryDelay
            );
        }
    }

    throw lastError;
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: errorMessages.UNAUTHORIZED },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const sortBy = searchParams.get("sortBy") || "name";
        const sortOrder = (searchParams.get("sortOrder") || "asc") as
            | "asc"
            | "desc";

        const categories = await retryOperation(() =>
            prisma.category.findMany({
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
            })
        );

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return NextResponse.json(
            { error: errorMessages.SERVER_ERROR },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    let session: Session | null = null;
    try {
        session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            console.error("[CATEGORIES_POST] No user ID in session:", session);
            return NextResponse.json(
                { error: errorMessages.UNAUTHORIZED },
                { status: 401 }
            );
        }

        // Verify that the user exists in the database
        const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true },
        });

        if (!userExists) {
            console.error(
                "[CATEGORIES_POST] User not found in database:",
                session.user.id
            );
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const validatedData = createCategorySchema.parse(body);

        const category = await retryOperation(() =>
            prisma.category.create({
                data: {
                    name: validatedData.name,
                    userId: session.user.id,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            })
        );

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORIES_POST] Error details:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: error.errors[0].message },
                { status: 400 }
            );
        }

        if (error && typeof error === "object" && "code" in error) {
            const prismaError = error as Prisma.PrismaClientKnownRequestError;
            console.error(
                `[CATEGORIES_POST] Prisma error code: ${prismaError.code}`,
                "Error meta:",
                prismaError.meta,
                "Error message:",
                prismaError.message,
                "User ID attempted:",
                session?.user?.id
            );

            if (prismaError.code === "P2003") {
                return NextResponse.json(
                    {
                        error: "Invalid user reference. Please try logging out and back in.",
                    },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: errorMessages.CATEGORY_CREATE_ERROR },
            { status: 500 }
        );
    }
}
