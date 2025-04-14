// --- Mocks ---
// Import mockPrismaClient early to be able to use in mocks
import type { MockPrismaClient } from "@/test-utils/api";
import { mockPrismaClient } from "@/test-utils/api";

jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

// Mock prisma
let prismaClient: MockPrismaClient;
jest.mock("@/lib/prisma", () => {
    prismaClient = mockPrismaClient({
        category: {
            findUnique: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
        },
    });
    return {
        __esModule: true,
        default: prismaClient,
    };
});

jest.mock("@/lib/auth", () => ({
    __esModule: true,
    authOptions: {
        providers: [],
        callbacks: {},
        session: { strategy: "jwt" },
    },
}));

// Add mock for next/server to handle NextResponse.json issue
jest.mock("next/server", () => {
    const originalModule = jest.requireActual("next/server");
    return {
        ...originalModule,
        NextResponse: {
            ...originalModule.NextResponse,
            json: jest.fn().mockImplementation((body, init) => ({
                status: init?.status || 200,
                headers: new Headers(init?.headers),
                json: async () => body,
                text: async () => JSON.stringify(body),
                ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
            })),
        },
    };
});

// --- Imports ---
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { DELETE, PATCH } from "./route";

// --- Test Data (Outer Scope) ---
const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
};
const mockSession = { user: mockUser };

// --- Tests ---
describe("Category API (/api/categories/[categoryId])", () => {
    // Test Data (Inner Scope)
    const mockCategory = {
        id: "cat-1",
        name: "Test Category",
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset Prisma mocks but keep the structure
        prismaClient.category.findUnique.mockReset();
        prismaClient.category.delete.mockReset();
        prismaClient.category.update.mockReset();

        // Mock getServerSession by default
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    // --- DELETE /api/categories/[categoryId] ---
    describe("DELETE", () => {
        it("should delete a category for an authenticated user", async () => {
            // Arrange: Mock Prisma
            prismaClient.category.findUnique.mockResolvedValue(mockCategory);
            prismaClient.category.delete.mockResolvedValue({});

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Act: Call handler with Request and params
            const response = await DELETE(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({ message: "Categoria excluída com sucesso" });
            expect(prisma.category.findUnique).toHaveBeenCalledWith({
                where: { id: mockCategory.id, userId: mockUser.id },
            });
            expect(prisma.category.delete).toHaveBeenCalledWith({
                where: { id: mockCategory.id, userId: mockUser.id },
            });
        });

        it("should return 404 if category not found", async () => {
            // Arrange: Mock Prisma
            prismaClient.category.findUnique.mockResolvedValue(null);

            const req = new Request(
                `http://localhost/api/categories/not-found-id`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const response = await DELETE(req, {
                params: { categoryId: "not-found-id" },
            });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Categoria não encontrada" });
        });

        it("should return 401 if user is not authenticated", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const response = await DELETE(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Não autorizado" });
        });

        it("should return 500 if database delete fails", async () => {
            // Arrange: Mock Prisma
            prismaClient.category.findUnique.mockResolvedValue(mockCategory);
            prismaClient.category.delete.mockRejectedValue(
                new Error("DB Error")
            );

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Act: Call handler with Request and params
            const response = await DELETE(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            // Assert
            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Erro interno do servidor" });
        });
    });

    // --- PATCH /api/categories/[categoryId] ---
    describe("PATCH", () => {
        const updateData = { name: "Updated Category Name" };

        it("should update a category for an authenticated user", async () => {
            // Arrange: Mock Prisma
            const updatedCategory = { ...mockCategory, ...updateData };
            Object.assign(
                prisma,
                mockPrismaClient({
                    category: {
                        findUnique: mockCategory,
                        update: updatedCategory,
                    },
                })
            );

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData), // Stringify body for Request
                }
            );

            // Act: Call handler with Request and params
            const response = await PATCH(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual(expect.objectContaining(updatedCategory));
            expect(prisma.category.findUnique).toHaveBeenCalledWith({
                where: { id: mockCategory.id, userId: mockUser.id },
            });
            expect(prisma.category.update).toHaveBeenCalledWith({
                where: { id: mockCategory.id, userId: mockUser.id },
                data: updateData,
            });
        });

        it("should return 400 if validation fails (ZodError)", async () => {
            const invalidData = { name: "" }; // Fails min(1)

            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(invalidData),
                }
            );

            const response = await PATCH(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                error: "O nome da categoria é obrigatório",
            }); // Matches Zod message
        });

        it("should return 404 if category not found", async () => {
            Object.assign(
                prisma,
                mockPrismaClient({
                    category: {
                        findUnique: null, // Simulate category not found
                    },
                })
            );

            const req = new Request(
                `http://localhost/api/categories/not-found-id`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData), // Add request body
                }
            );

            const response = await PATCH(req, {
                params: { categoryId: "not-found-id" },
            });
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Categoria não encontrada" });
        });

        it("should return 401 if user is not authenticated", async () => {
            (getServerSession as jest.Mock).mockResolvedValue(null);

            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const response = await PATCH(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Não autorizado" });
        });

        it("should return 500 if database update fails", async () => {
            Object.assign(
                prisma,
                mockPrismaClient({
                    category: {
                        findUnique: mockCategory, // Find succeeds
                        update: jest
                            .fn()
                            .mockRejectedValue(new Error("DB Error")),
                    },
                })
            );

            const req = new Request(
                `http://localhost/api/categories/${mockCategory.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                }
            );

            const response = await PATCH(req, {
                params: { categoryId: mockCategory.id },
            });
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Erro interno do servidor" });
        });
    });
});
