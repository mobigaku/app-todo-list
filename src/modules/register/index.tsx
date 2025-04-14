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
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormField } from "./components/form-field";
import { PasswordStrengthIndicator } from "./components/password-strength-indicator";
import { useRegisterForm } from "./hooks/use-register-form";

export function RegisterForm() {
    const router = useRouter();
    const {
        form,
        isLoading,
        showPassword,
        passwordStrength,
        strengthColor,
        togglePasswordVisibility,
        handleSubmit,
    } = useRegisterForm();

    const passwordToggleButton = (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            disabled={isLoading}
        >
            {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
                {showPassword ? "Ocultar senha" : "Mostrar senha"}
            </span>
        </Button>
    );

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
            <form onSubmit={handleSubmit} className="space-y-4">
                <CardContent className="space-y-4">
                    <FormField
                        id="name"
                        label="Nome"
                        placeholder="Seu nome"
                        icon={User}
                        disabled={isLoading}
                        registration={form.register("name")}
                        error={form.formState.errors.name?.message}
                    />
                    <FormField
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        icon={Mail}
                        disabled={isLoading}
                        registration={form.register("email")}
                        error={form.formState.errors.email?.message}
                    />
                    <FormField
                        id="password"
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        icon={Lock}
                        disabled={isLoading}
                        registration={form.register("password")}
                        error={form.formState.errors.password?.message}
                        rightElement={passwordToggleButton}
                    />
                    <PasswordStrengthIndicator
                        password={form.watch("password")}
                        strength={passwordStrength}
                        strengthColor={strengthColor}
                    />
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
