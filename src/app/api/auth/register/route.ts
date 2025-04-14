import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { message: "Dados inválidos", errors: result.error.errors },
                { status: 400 }
            );
        }

        const { email, password, name } = result.data;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email já está em uso" },
                { status: 400 }
            );
        }

        let hashedPassword;
        try {
            hashedPassword = await hash(password, 12);
        } catch (error) {
            console.error("Registration error:", error);
            return NextResponse.json(
                { message: "Erro ao criar usuário" },
                { status: 500 }
            );
        }

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });

            return NextResponse.json(
                {
                    message: "Usuário criado com sucesso",
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    },
                },
                { status: 201 }
            );
        } catch (error) {
            console.error("Registration error:", error);
            return NextResponse.json(
                { message: "Erro ao criar usuário" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Erro ao criar usuário" },
            { status: 500 }
        );
    }
}
