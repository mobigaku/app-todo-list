import { ERROR_MESSAGES, RETRY_CONFIG } from "@/constants/errors";

// Custom error classes
export class APIError extends Error {
    constructor(message: string, public status?: number, public code?: string) {
        super(message);
        this.name = "APIError";
    }
}

export class ValidationError extends Error {
    constructor(message: string, public errors?: Record<string, string[]>) {
        super(message);
        this.name = "ValidationError";
    }
}

// Error messages in Brazilian Portuguese
export const errorMessages = {
    // Authentication errors
    UNAUTHORIZED: "Você precisa estar logado para realizar esta ação",
    FORBIDDEN: "Você não tem permissão para realizar esta ação",
    SESSION_EXPIRED: "Sua sessão expirou. Por favor, faça login novamente",

    // Validation errors
    INVALID_INPUT: "Dados inválidos. Por favor, verifique os campos",
    REQUIRED_FIELD: "Este campo é obrigatório",
    INVALID_EMAIL: "Email inválido",
    INVALID_PASSWORD: "Senha inválida",

    // Resource errors
    NOT_FOUND: "Recurso não encontrado",
    ALREADY_EXISTS: "Este recurso já existe",

    // Task-specific errors
    TASK_NOT_FOUND: "Tarefa não encontrada",
    TASK_CREATE_ERROR: "Erro ao criar tarefa",
    TASK_UPDATE_ERROR: "Erro ao atualizar tarefa",
    TASK_DELETE_ERROR: "Erro ao excluir tarefa",

    // Task-specific success messages
    TASK_CREATE_SUCCESS: "Tarefa criada com sucesso",
    TASK_UPDATE_SUCCESS: "Tarefa atualizada com sucesso",
    TASK_DELETE_SUCCESS: "Tarefa excluída com sucesso",

    // Category-specific errors
    CATEGORY_NOT_FOUND: "Categoria não encontrada",
    CATEGORY_CREATE_ERROR: "Erro ao criar categoria",
    CATEGORY_UPDATE_ERROR: "Erro ao atualizar categoria",
    CATEGORY_DELETE_ERROR: "Erro ao excluir categoria",
    CATEGORY_WITH_TASKS:
        "Não é possível excluir uma categoria que contém tarefas",

    // Category-specific success messages
    CATEGORY_CREATE_SUCCESS: "Categoria criada com sucesso",
    CATEGORY_UPDATE_SUCCESS: "Categoria atualizada com sucesso",
    CATEGORY_DELETE_SUCCESS: "Categoria excluída com sucesso",

    // Generic errors
    UNKNOWN_ERROR: "Ocorreu um erro inesperado",
    NETWORK_ERROR: "Erro de conexão. Por favor, verifique sua internet",
    SERVER_ERROR: "Erro interno do servidor",
} as const;

// Helper function to handle API responses
export async function handleAPIResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message = data.error || errorMessages.UNKNOWN_ERROR;
        throw new APIError(message, response.status);
    }
    return response.json();
}

// Helper function to format validation errors
export function formatValidationErrors(
    errors: Record<string, string[]>
): string {
    return Object.entries(errors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("\n");
}

// Helper function to get user-friendly error message
export function getUserFriendlyErrorMessage(error: unknown): string {
    if (error instanceof APIError) {
        return error.message;
    }

    if (error instanceof ValidationError) {
        return error.message;
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
        const prismaError = error as {
            code: string;
            meta?: Record<string, unknown>;
        };

        switch (prismaError.code) {
            case "P2002":
                return errorMessages.ALREADY_EXISTS;
            case "P2025":
                return errorMessages.NOT_FOUND;
            case "P2003":
                return errorMessages.INVALID_INPUT;
            default:
                console.error("[PRISMA_ERROR]", {
                    code: prismaError.code,
                    meta: prismaError.meta,
                    error,
                });
                return errorMessages.SERVER_ERROR;
        }
    }

    if (error instanceof Error) {
        // Log unexpected errors for debugging
        console.error("[UNEXPECTED_ERROR]", {
            name: error.name,
            message: error.message,
            stack: error.stack,
            error,
        });

        // Check for network errors
        if (error.message.includes("fetch")) {
            return errorMessages.NETWORK_ERROR;
        }
        return error.message;
    }

    // Log unknown error types
    console.error("[UNKNOWN_ERROR]", { error });
    return errorMessages.UNKNOWN_ERROR;
}

// Helper function to determine if an error should trigger a retry
export function shouldRetry(error: unknown): boolean {
    // Don't retry Prisma unique constraint violations
    if (error && typeof error === "object" && "code" in error) {
        const prismaError = error as { code: string };
        if (prismaError.code === "P2002") {
            return false;
        }
    }

    if (error instanceof APIError) {
        // Don't retry client errors (4xx)
        if (error.status && error.status >= 400 && error.status < 500) {
            return false;
        }
        // Retry server errors (5xx)
        return true;
    }

    // Retry network errors
    if (error instanceof Error && error.message.includes("fetch")) {
        return true;
    }

    return false;
}

// Constants for retry configuration
export const retryConfig = {
    maxRetries: 3,
    initialRetryDelay: 1000 as number, // 1 second
    maxRetryDelay: 5000 as number, // 5 seconds
    backoffFactor: 2 as number, // Exponential backoff
} as const;

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        if (error.message.includes("UNAUTHORIZED")) {
            return ERROR_MESSAGES.UNAUTHORIZED;
        }
        if (error.message.includes("UNAUTHENTICATED")) {
            return ERROR_MESSAGES.UNAUTHENTICATED;
        }
        if (error.message.includes("INVALID_CREDENTIALS")) {
            return ERROR_MESSAGES.INVALID_CREDENTIALS;
        }
        if (error.message.includes("INVALID_TOKEN")) {
            return ERROR_MESSAGES.INVALID_TOKEN;
        }
        if (error.message.includes("NOT_FOUND")) {
            return ERROR_MESSAGES.NOT_FOUND;
        }
        if (error.message.includes("VALIDATION_ERROR")) {
            return ERROR_MESSAGES.VALIDATION_ERROR;
        }
        if (error.message.includes("DUPLICATE_ENTRY")) {
            return ERROR_MESSAGES.DUPLICATE_ENTRY;
        }
        if (error.message.includes("FORBIDDEN")) {
            return ERROR_MESSAGES.FORBIDDEN;
        }
        if (error.message.includes("RATE_LIMIT")) {
            return ERROR_MESSAGES.RATE_LIMIT;
        }
        if (error.message.includes("BAD_REQUEST")) {
            return ERROR_MESSAGES.BAD_REQUEST;
        }
        if (error.message.includes("NETWORK_ERROR")) {
            return ERROR_MESSAGES.NETWORK_ERROR;
        }
        if (error.message.includes("TIMEOUT")) {
            return ERROR_MESSAGES.TIMEOUT;
        }
        return error.message;
    }
    return ERROR_MESSAGES.UNKNOWN;
}

export function handleApiError(error: unknown): never {
    throw new Error(getErrorMessage(error));
}

export const retryWithBackoff = RETRY_CONFIG;
