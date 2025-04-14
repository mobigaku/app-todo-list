import {
    registerSchema,
    type RegisterFormData,
} from "@/src/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
    calculatePasswordStrength,
    getPasswordStrengthText,
} from "../utils/password-utils";

export const useRegisterForm = () => {
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

    const passwordStrength = form.watch("password")
        ? calculatePasswordStrength(form.watch("password"))
        : 0;

    const strengthColor = getPasswordStrengthText(passwordStrength);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

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

    return {
        form,
        isLoading,
        showPassword,
        passwordStrength,
        strengthColor,
        togglePasswordVisibility,
        handleSubmit: form.handleSubmit(handleSubmit),
    };
};
