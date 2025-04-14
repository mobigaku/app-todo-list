"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    registerSchema,
    type RegisterFormData,
} from "@/src/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const form = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        mode: "onChange",
    });

    const calculatePasswordStrength = (password: string): number => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        if (password.match(/[^A-Za-z0-9]/)) strength += 25;
        return strength;
    };

    const passwordStrength = form.watch("password")
        ? calculatePasswordStrength(form.watch("password"))
        : 0;

    const getPasswordStrengthText = (
        strength: number
    ): { text: string; color: string } => {
        if (strength === 0) return { text: "", color: "" };
        if (strength <= 25) return { text: "Fraca", color: "text-red-500" };
        if (strength <= 50) return { text: "Média", color: "text-yellow-500" };
        if (strength <= 75) return { text: "Boa", color: "text-blue-500" };
        return { text: "Forte", color: "text-green-500" };
    };

    const handleSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Erro ao criar conta");
            }

            toast.success("Conta criada com sucesso!", {
                description: "Redirecionando para o login...",
                duration: 3000,
            });

            // Delay redirect slightly to show the success message
            setTimeout(() => {
                router.push("/login");
            }, 1000);
        } catch (error) {
            toast.error("Erro ao criar conta", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Ocorreu um erro inesperado",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const strengthColor = getPasswordStrengthText(passwordStrength);

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg animate-in fade-in-50 duration-500">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-bold text-center">
                    Criar Conta
                </CardTitle>
                <CardDescription className="text-center">
                    Crie sua conta para começar a gerenciar suas tarefas de
                    forma organizada
                </CardDescription>
            </CardHeader>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
            >
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                            Nome
                        </Label>
                        <div className="relative">
                            <Input
                                id="name"
                                type="text"
                                placeholder="Seu nome"
                                className="pl-10 transition-colors focus:ring-2"
                                autoComplete="name"
                                disabled={isLoading}
                                {...form.register("name")}
                                aria-invalid={!!form.formState.errors.name}
                            />
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                            Email
                        </Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                className="pl-10 transition-colors focus:ring-2"
                                autoComplete="email"
                                disabled={isLoading}
                                {...form.register("email")}
                                aria-invalid={!!form.formState.errors.email}
                            />
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        {form.formState.errors.email && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Senha
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="pl-10 pr-10 transition-colors focus:ring-2"
                                autoComplete="new-password"
                                disabled={isLoading}
                                {...form.register("password")}
                                aria-invalid={!!form.formState.errors.password}
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="sr-only">
                                    {showPassword
                                        ? "Ocultar senha"
                                        : "Mostrar senha"}
                                </span>
                            </Button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                        {form.watch("password") && (
                            <div className="space-y-2">
                                <Progress
                                    value={passwordStrength}
                                    className="h-1"
                                />
                                <p className={`text-xs ${strengthColor.color}`}>
                                    Força da senha: {strengthColor.text}
                                </p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                    <li
                                        className={
                                            form.watch("password")?.length >= 8
                                                ? "text-green-500"
                                                : ""
                                        }
                                    >
                                        • Mínimo de 8 caracteres
                                    </li>
                                    <li
                                        className={
                                            form
                                                .watch("password")
                                                ?.match(/[A-Z]/)
                                                ? "text-green-500"
                                                : ""
                                        }
                                    >
                                        • Pelo menos uma letra maiúscula
                                    </li>
                                    <li
                                        className={
                                            form
                                                .watch("password")
                                                ?.match(/[0-9]/)
                                                ? "text-green-500"
                                                : ""
                                        }
                                    >
                                        • Pelo menos um número
                                    </li>
                                    <li
                                        className={
                                            form
                                                .watch("password")
                                                ?.match(/[^A-Za-z0-9]/)
                                                ? "text-green-500"
                                                : ""
                                        }
                                    >
                                        • Pelo menos um caractere especial
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full font-semibold"
                        disabled={isLoading || !form.formState.isValid}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            "Criar conta"
                        )}
                    </Button>
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Ou
                            </span>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full font-semibold"
                        onClick={() => router.push("/login")}
                        disabled={isLoading}
                    >
                        Já tem uma conta? Entrar
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
