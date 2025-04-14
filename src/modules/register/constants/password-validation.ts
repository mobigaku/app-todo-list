export const PASSWORD_VALIDATION_RULES = [
    {
        id: "minLength",
        message: "Mínimo de 8 caracteres",
        validator: (password: string) => password.length >= 8,
    },
    {
        id: "uppercase",
        message: "Pelo menos uma letra maiúscula",
        validator: (password: string) => /[A-Z]/.test(password),
    },
    {
        id: "number",
        message: "Pelo menos um número",
        validator: (password: string) => /[0-9]/.test(password),
    },
    {
        id: "special",
        message: "Pelo menos um caractere especial",
        validator: (password: string) => /[^A-Za-z0-9]/.test(password),
    },
] as const;

export const PASSWORD_STRENGTH_LEVELS = {
    EMPTY: { text: "", color: "", threshold: 0 },
    WEAK: { text: "Fraca", color: "text-red-500", threshold: 25 },
    MEDIUM: { text: "Média", color: "text-yellow-500", threshold: 50 },
    GOOD: { text: "Boa", color: "text-blue-500", threshold: 75 },
    STRONG: { text: "Forte", color: "text-green-500", threshold: 100 },
} as const;
