// --- Mocks ---
// Import mockPrismaClient early to be able to use in mocks
import type { MockPrismaClient } from "@/test-utils/api";
import { mockPrismaClient } from "@/test-utils/api";

// Mock next/server
jest.mock("next/server", () => {
    const originalModule = jest.requireActual("next/server");
    return {
        ...originalModule,
        NextRequest: function (input: string | URL, init?: RequestInit) {
            const url = input instanceof URL ? input : new URL(input);
            const req = new Request(url, init);
            Object.defineProperty(req, "nextUrl", {
                get: () => url,
                enumerable: true,
                configurable: true,
            });
            Object.defineProperty(req, "searchParams", {
                get: () => url.searchParams,
                enumerable: true,
                configurable: true,
            });
            return req;
        },
        NextResponse: {
            ...originalModule.NextResponse,
            json: jest
                .fn()
                .mockImplementation((body: unknown, init?: ResponseInit) => ({
                    status: init?.status || 200,
                    headers: new Headers(init?.headers),
                    json: async () => body,
                    text: async () => JSON.stringify(body),
                    ok:
                        (init?.status || 200) >= 200 &&
                        (init?.status || 200) < 300,
                })),
            redirect: jest
                .fn()
                .mockImplementation((url: string, init?: ResponseInit) => ({
                    status: init?.status || 307,
                    headers: new Headers({
                        location: url,
                        ...(init?.headers || {}),
                    }),
                    json: async () => ({}),
                    text: async () => "",
                    ok: false,
                })),
        },
    };
});

jest.mock("@/lib/auth", () => ({
    __esModule: true,
    getCurrentUser: jest.fn(),
    getSession: jest.fn(),
    authOptions: {
        providers: [],
        callbacks: {},
        session: { strategy: "jwt" },
    },
}));

// Mock prisma
let prismaClient: MockPrismaClient;
jest.mock("@/lib/prisma", () => {
    prismaClient = mockPrismaClient({
        task: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    });
    return {
        __esModule: true,
        default: prismaClient,
    };
});

// --- Imports ---
import { getCurrentUser } from "@/lib/auth";
import { Priority, Status } from "@prisma/client";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

// --- Tests ---
describe("Tasks API (/api/tasks)", () => {
    // --- Test Data ---
    const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
    };

    const mockTasks = [
        {
            id: "1",
            name: "Test Task 1",
            description: "Description 1",
            status: Status.PENDING,
            priority: Priority.MEDIUM,
            userId: "1",
            categoryId: "1",
            startDate: new Date(),
            endDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: "2",
            name: "Test Task 2",
            description: "Description 2",
            status: Status.IN_PROGRESS,
            priority: Priority.HIGH,
            userId: "1",
            categoryId: "1",
            startDate: new Date(),
            endDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset Prisma mocks but keep the structure
        prismaClient.task.findMany.mockReset();
        prismaClient.task.count.mockReset();
        prismaClient.task.create.mockReset();
        prismaClient.task.update.mockReset();
        prismaClient.task.delete.mockReset();

        // Mock getCurrentUser implementation for most tests
        (getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    });

    // --- GET /api/tasks ---
    describe("GET /api/tasks", () => {
        it("should return tasks with pagination", async () => {
            // Arrange: Mock Prisma
            prismaClient.task.findMany.mockResolvedValue(mockTasks);
            prismaClient.task.count.mockResolvedValue(2);

            // Arrange: Create NextRequest object with search params
            const url = new URL("http://localhost/api/tasks");
            url.searchParams.set("page", "1");
            url.searchParams.set("limit", "10");
            url.searchParams.set("sortBy", "createdAt");
            url.searchParams.set("sortOrder", "desc");
            const req = new NextRequest(url);

            // Act
            const response = await GET(req);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toEqual({
                tasks: mockTasks,
                pagination: {
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasMore: false,
                },
            });
            expect(getCurrentUser).toHaveBeenCalled(); // Verify auth check happened
        });

        it("should filter tasks by category", async () => {
            // Arrange: Mock Prisma
            prismaClient.task.findMany.mockResolvedValue([mockTasks[0]]);
            prismaClient.task.count.mockResolvedValue(1);

            // Arrange: Create NextRequest object with search params
            const url = new URL("http://localhost/api/tasks");
            url.searchParams.set("categoryId", "1");
            const req = new NextRequest(url);

            // Act
            const response = await GET(req);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data.tasks).toHaveLength(1);
            expect(getCurrentUser).toHaveBeenCalled();
        });

        it("should redirect to login if user is not authenticated", async () => {
            // Arrange: Mock auth
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            // Arrange: Create NextRequest object
            const req = new NextRequest("http://localhost/api/tasks");

            // Act
            const response = await GET(req);

            // Assert
            expect(response.status).toBe(307);
            expect(response.headers.get("location")).toContain("/login");
            expect(getCurrentUser).toHaveBeenCalled();
        });
    });

    // --- POST /api/tasks ---
    describe("POST /api/tasks", () => {
        const newTaskData = {
            name: "New Task",
            description: "New Description",
            status: Status.PENDING,
            priority: Priority.HIGH,
            categoryId: "1",
            startDate: new Date().toISOString(),
            endDate: null,
        };

        it("should create a new task", async () => {
            // Arrange: Mock Prisma
            const createdTask = {
                ...newTaskData,
                id: "3",
                userId: mockUser.id,
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prismaClient.task.create.mockResolvedValue(createdTask);

            // Arrange: Create NextRequest object
            const req = new NextRequest("http://localhost/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTaskData),
            });

            // Act
            const response = await POST(req);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(200);
            expect(data).toMatchObject(createdTask);
            expect(getCurrentUser).toHaveBeenCalled();
        });

        it("should return 401 if user is not authenticated", async () => {
            // Arrange: Mock auth
            (getCurrentUser as jest.Mock).mockResolvedValue(null);

            // Arrange: Create NextRequest object
            const req = new NextRequest("http://localhost/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTaskData),
            });

            // Act
            const response = await POST(req);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(401);
            expect(data).toEqual({ error: "Unauthorized" });
            expect(getCurrentUser).toHaveBeenCalled();
        });

        it("should handle validation errors (simulated via Prisma reject)", async () => {
            // Arrange: Mock Prisma failure
            prismaClient.task.create.mockRejectedValue(
                new Error("Validation error")
            );

            // Arrange: Create NextRequest object with invalid data
            const invalidData = { ...newTaskData, status: "INVALID_STATUS" };
            const req = new NextRequest("http://localhost/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invalidData),
            });

            // Act
            const response = await POST(req);
            const data = await response.json();

            // Assert
            expect(response.status).toBe(400);
            expect(data).toEqual({ error: "Dados inválidos" });
            expect(getCurrentUser).toHaveBeenCalled();
        });
    });
});
