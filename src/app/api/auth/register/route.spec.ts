// --- Mocks ---
// Import mockPrismaClient early to be able to use in mocks
import type { MockPrismaClient } from "@/test-utils/api";
import { mockPrismaClient } from "@/test-utils/api";

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
    hash: jest.fn(),
}));

// Mock next/server
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

// Mock prisma
let prismaClient: MockPrismaClient;
jest.mock("@/lib/prisma", () => {
    prismaClient = mockPrismaClient({
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    });
    return {
        __esModule: true,
        default: prismaClient,
    };
});

// Mock the validation schema (optional, but can simplify testing)
jest.mock("@/lib/validations/auth", () => ({
    registerSchema: {
        safeParse: jest.fn().mockImplementation((data) => ({
            success: true, // Assume valid by default in tests
            data: data, // Return the input data
        })),
    },
}));

// --- Imports ---
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth"; // Corrected import path alias
import { hash } from "bcryptjs";
import { POST } from "./route";

describe("Register API (/api/auth/register)", () => {
    const validRegisterData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
    };

    const mockCreatedUser = {
        id: "user-123",
        name: validRegisterData.name,
        email: validRegisterData.email,
        password: "hashedpassword", // Placeholder
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset schema mock implementation for each test
        (registerSchema.safeParse as jest.Mock).mockImplementation((data) => ({
            success: true,
            data: data,
        }));

        // Mock bcrypt hash function
        (hash as jest.Mock).mockResolvedValue("hashedpassword");

        // Reset Prisma mocks but keep the structure
        prismaClient.user.findUnique.mockReset();
        prismaClient.user.create.mockReset();
    });

    it("should register a new user successfully", async () => {
        // Arrange: Mock Prisma & bcrypt
        prismaClient.user.findUnique.mockResolvedValue(null);
        prismaClient.user.create.mockResolvedValue(mockCreatedUser);

        // Arrange: Create standard Request object
        const req = new Request(`http://localhost/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRegisterData),
        });

        // Act
        const response = await POST(req);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(201);
        expect(data).toEqual({
            message: "Usuário criado com sucesso",
            user: {
                id: mockCreatedUser.id,
                email: mockCreatedUser.email,
                name: mockCreatedUser.name,
            },
        });
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: validRegisterData.email },
        });
        expect(hash).toHaveBeenCalledWith(validRegisterData.password, 12);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                email: validRegisterData.email,
                password: "hashedpassword",
                name: validRegisterData.name,
            },
        });
    });

    it("should return 400 if validation fails", async () => {
        // Arrange: Mock schema validation to fail (if mocking schema)
        const validationError = { errors: [{ message: "Invalid email" }] };
        (registerSchema.safeParse as jest.Mock).mockReturnValue({
            success: false,
            error: validationError,
        });

        // Arrange: Create standard Request object with invalid data
        const req = new Request(`http://localhost/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...validRegisterData,
                email: "invalid-email",
            }),
        });

        // Act
        const response = await POST(req);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(data).toEqual({
            message: "Dados inválidos",
            errors: validationError.errors,
        });
        expect(prisma.user.findUnique).not.toHaveBeenCalled();
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should return 400 if user already exists", async () => {
        // Arrange: Mock Prisma
        prismaClient.user.findUnique.mockResolvedValue(mockCreatedUser);

        // Arrange: Create standard Request object
        const req = new Request(`http://localhost/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRegisterData),
        });

        // Act
        const response = await POST(req);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(400);
        expect(data).toEqual({ message: "Email já está em uso" });
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: validRegisterData.email },
        });
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should handle user creation failure", async () => {
        // Mock findUnique to return null (user doesn't exist)
        prismaClient.user.findUnique.mockResolvedValue(null);
        // Mock create to throw an error
        prismaClient.user.create.mockRejectedValue(
            new Error("Creation failed")
        );

        // Create request
        const req = new Request(`http://localhost/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validRegisterData),
        });

        // Act
        const response = await POST(req);
        const data = await response.json();

        // Assert
        expect(response.status).toBe(500);
        expect(data).toEqual({ message: "Erro ao criar usuário" });
    });
});
