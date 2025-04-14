import { PrismaClient } from "@prisma/client";

// Remove types related to node-mocks-http and next
// export type TestNextApiResponse<T = unknown> = ...
// export type TestNextApiRequest = ...

// Remove createApiMocks function
// export function createApiMocks<T = unknown>(...) { ... }

// --- MockPrismaClient function and related types remain the same ---
type PrismaMockData = {
    [Model in keyof PrismaClient]?: {
        [Method in keyof PrismaClient[Model]]?: unknown;
    };
};

type MockPrismaModel = {
    [key: string]: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    upsert: jest.Mock;
    count: jest.Mock;
} & jest.Mock;

type BasePrismaMock = {
    -readonly [Model in keyof PrismaClient]: MockPrismaModel;
};

export type MockPrismaClient = BasePrismaMock & {
    $transaction: jest.Mock;
    $connect: jest.Mock;
    $disconnect: jest.Mock;
    $use: jest.Mock;
    $executeRaw: jest.Mock;
    $queryRaw: jest.Mock;
    $on: jest.Mock;
};

/**
 * Mock Prisma client for testing
 * Usage: const prismaMock = mockPrismaClient({ user: { findMany: [{ id: 1, name: 'Test' }] } });
 */
export function mockPrismaClient(mockData: PrismaMockData): MockPrismaClient {
    const prismaClient = {
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $use: jest.fn(),
        $executeRaw: jest.fn(),
        $queryRaw: jest.fn(),
        $on: jest.fn(),
        $transaction: jest.fn().mockImplementation(async (arg) => {
            // Handle both function and array cases
            if (typeof arg === "function") {
                // For transaction(fn) case
                const tx = prismaClient; // Use same mock for transaction
                return arg(tx);
            }
            // For transaction([op1, op2, ...]) case
            return Promise.all(arg);
        }),
    } as MockPrismaClient;

    // Create base model methods
    const baseModelMethods = {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
    };

    // Initialize all Prisma models with base methods
    for (const model of Object.keys(mockData)) {
        const modelMock = jest.fn() as unknown as MockPrismaModel;
        Object.assign(modelMock, baseModelMethods);
        prismaClient[model as keyof PrismaClient] = modelMock;
    }

    // Override with provided mock implementations
    for (const [modelName, methods] of Object.entries(mockData)) {
        const model = modelName as keyof PrismaClient;
        if (methods) {
            for (const [methodName, returnValue] of Object.entries(methods)) {
                const mockFn = jest.fn().mockResolvedValue(returnValue);
                (prismaClient[model] as MockPrismaModel)[methodName] = mockFn;
            }
        }
    }

    return prismaClient;
}

// Remove assertApiResponse function as it relies on node-mocks-http response
// export function assertApiResponse<T>(...) { ... }
