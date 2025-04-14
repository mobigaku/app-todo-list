export const ERROR_MESSAGES = {
    UNAUTHORIZED: "Você não está autorizado a realizar esta ação.",
    UNAUTHENTICATED: "Você precisa estar logado para realizar esta ação.",
    INVALID_CREDENTIALS: "Credenciais inválidas.",
    INVALID_TOKEN: "Token inválido ou expirado.",
    INVALID_REQUEST: "Requisição inválida.",
    NOT_FOUND: "Recurso não encontrado.",
    INTERNAL_ERROR: "Erro interno do servidor.",
    VALIDATION_ERROR: "Erro de validação.",
    DUPLICATE_ENTRY: "Registro duplicado.",
    FORBIDDEN: "Acesso negado.",
    RATE_LIMIT: "Limite de requisições excedido.",
    BAD_REQUEST: "Requisição inválida.",
    NETWORK_ERROR: "Erro de conexão.",
    TIMEOUT: "Tempo limite excedido.",
    UNKNOWN: "Erro desconhecido.",
};

export const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    backoffFactor: 2,
    maxDelay: 5000,
};
