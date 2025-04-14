import prisma from "@/lib/prisma";
import { mockPrismaClient } from "@/test-utils/api";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

// Mock next-auth
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

// Mock the auth module FIRST, mocking getCurrentUser
jest.mock("@/lib/auth", () => ({
    __esModule: true,
    getCurrentUser: jest.fn(),
    authOptions: { providers: [], callbacks: {} },
}));

// Mock the prisma module
jest.mock("@/lib/prisma", () => ({
    __esModule: true,
    default: {},
}));

// Mock error messages
jest.mock("@/lib/error-handling", () => ({
    __esModule: true,
    errorMessages: {
        UNAUTHORIZED: "Você precisa estar logado para realizar esta ação",
        SERVER_ERROR: "Erro interno do servidor",
        CATEGORY_CREATE_ERROR: "Erro ao criar categoria",
        USER_NOT_FOUND: "Usuário não encontrado",
    },
    retryConfig: {
        maxRetries: 3,
        initialRetryDelay: 100,
        backoffFactor: 2,
        maxRetryDelay: 1000,
    },
}));

describe("Categories API", () => {
    const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
    };

    const mockSession = {
        user: mockUser,
    };

    const mockCategories = [
        {
            id: "1",
            name: "Work",
            userId: "1",
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: {
                tasks: 5,
            },
        },
        {
            id: "2",
            name: "Personal",
            userId: "1",
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: {
                tasks: 3,
            },
        },
    ];

    beforeEach(() => {
        // Reset all mocks before each test
        jest.resetModules();
        jest.clearAllMocks();

        // Assign mock Prisma client
        Object.assign(prisma, mockPrismaClient({}));

        // Mock getServerSession implementation
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    describe("GET /api/categories", () => {
        it("should return categories with task counts", async () => {
            // Mock Prisma client
            Object.assign(
                prisma,
                mockPrismaClient({
                    category: {
                        findMany: mockCategories,
                    },
                })
            );

            // Create mock request
            const req = new Request("http://localhost/api/categories", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            // Convert mockCategories dates to strings to match API response
            const expectedCategories = mockCategories.map((cat) => ({
                ...cat,
                createdAt: cat.createdAt.toISOString(),
                updatedAt: cat.updatedAt.toISOString(),
            }));
            expect(data).toEqual(expectedCategories);
            expect(getServerSession).toHaveBeenCalled();
            expect(prisma.category.findMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
                include: { _count: { select: { tasks: true } } },
                orderBy: { name: "asc" },
            });
        });

        it("should filter categories by search term", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);

            Object.assign(
                prisma,
                mockPrismaClient({
                    category: {
                        findMany: [mockCategories[0]], // Only return "Work" category
                    },
                })
            );

            const url = new URL("http://localhost/api/categories");
            url.searchParams.set("search", "Work");
            const req = new Request(url.toString(), {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const response = await GET(req as NextRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toHaveLength(1);
            expect(data[0].name).toBe("Work");
        });

        it("should return 401 if user is not authenticated", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const req = new Request("http://localhost/api/categories", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                error: "Você precisa estar logado para realizar esta ação",
            });
            expect(getServerSession).toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            Object.assign(
                prisma,
                mockPrismaClient({
                    category: {
                        findMany: jest
                            .fn()
                            .mockRejectedValue(new Error("DB Error")),
                    },
                })
            );

            const req = new Request("http://localhost/api/categories", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            const response = await GET(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Erro interno do servidor" });
            expect(getServerSession).toHaveBeenCalled();
        });
    });

    describe("POST /api/categories", () => {
        const newCategory = {
            name: "New Category",
        };

        it("should create a new category", async () => {
            const createdCategory = {
                ...newCategory,
                id: "cat-new",
                userId: mockUser.id,
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                },
            };

            Object.assign(
                prisma,
                mockPrismaClient({
                    user: { findUnique: { id: mockUser.id } },
                    category: { create: createdCategory },
                })
            );

            const req = new Request("http://localhost/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(createdCategory);
            expect(getServerSession).toHaveBeenCalled();
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                select: { id: true },
            });
            expect(prisma.category.create).toHaveBeenCalledWith({
                data: { ...newCategory, userId: mockUser.id },
                include: { user: { select: { id: true, email: true } } },
            });
        });

        it("should return 401 if user is not authenticated", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const req = new Request("http://localhost/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({
                error: "Você precisa estar logado para realizar esta ação",
            });
            expect(getServerSession).toHaveBeenCalled();
            expect(prisma.category.create).not.toHaveBeenCalled();
        });

        it("should return 404 if user does not exist in database", async () => {
            Object.assign(
                prisma,
                mockPrismaClient({
                    user: { findUnique: null },
                })
            );

            const req = new Request("http://localhost/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "User not found" });
        });

        it("should return 400 if validation fails", async () => {
            // Mock user existence check to succeed
            Object.assign(
                prisma,
                mockPrismaClient({
                    user: { findUnique: { id: mockUser.id } },
                })
            );

            const invalidData = { name: "" };
            const req = new Request("http://localhost/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invalidData),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: "O nome da categoria é obrigatório",
            });
            expect(getServerSession).toHaveBeenCalled();
            expect(prisma.category.create).not.toHaveBeenCalled();
        });

        it("should handle database errors during creation", async () => {
            Object.assign(
                prisma,
                mockPrismaClient({
                    user: { findUnique: { id: mockUser.id } },
                    category: {
                        create: jest
                            .fn()
                            .mockRejectedValue(new Error("DB Error")),
                    },
                })
            );

            const req = new Request("http://localhost/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            const response = await POST(req);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Erro ao criar categoria" });
            expect(getServerSession).toHaveBeenCalled();
        });

        it("should handle foreign key constraint errors", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(mockSession);

            Object.assign(
                prisma,
                mockPrismaClient({
                    user: {
                        findUnique: { id: "1" },
                    },
                    category: {
                        create: Promise.reject({
                            code: "P2003",
                            meta: { field_name: "userId" },
                            message: "Foreign key constraint failed",
                        }),
                    },
                })
            );

            const req = new Request("http://localhost/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCategory),
            });

            const response = await POST(req as NextRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: "Invalid user reference. Please try logging out and back in.",
            });
        });
    });
});
