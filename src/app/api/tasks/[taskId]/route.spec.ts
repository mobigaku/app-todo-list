// --- Mocks ---
// Import mockPrismaClient early to be able to use in mocks
import { mockPrismaClient } from "@/test-utils/api";

jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
    __esModule: true,
    db: mockPrismaClient({}), // Initialize with mockPrismaClient
}));

// Mock the auth module FIRST, mocking getCurrentUser
jest.mock("@/lib/auth", () => ({
    __esModule: true,
    getCurrentUser: jest.fn(),
    authOptions: { providers: [], callbacks: {} },
}));

// --- Imports ---
import { db } from "@/lib/db"; // Import after mock
import { Priority, Status } from "@prisma/client";
import { getServerSession } from "next-auth"; // Import after mock
import { DELETE, GET, PATCH } from "./route";

// --- Test Data (Outer Scope) ---
const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
};
const mockSession = { user: mockUser };

// --- Tests ---
describe("Task API (/api/tasks/[taskId])", () => {
    // Test Data (Inner Scope)
    const mockTask = {
        id: "task-1",
        name: "Test Task 1",
        description: "Description 1",
        status: Status.PENDING,
        priority: Priority.MEDIUM,
        startDate: new Date("2024-01-01T00:00:00.000Z"),
        endDate: null,
        userId: mockUser.id,
        categoryId: "cat-1",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        // Mock getServerSession by default
        // We mock getServerSession from next-auth as it's called directly
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    // --- GET /api/tasks/[taskId] ---
    describe("GET", () => {
        it("should return 404 if task not found", async () => {
            // Arrange: Mock Prisma
            Object.assign(db, mockPrismaClient({ task: { findUnique: null } }));

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/tasks/non-existent-id`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Act: Call handler with standard Request
            const response = await GET(req, {
                params: { taskId: "non-existent-id" },
            });
            const text = await response.text(); // Check text for non-JSON error response

            // Assert
            expect(response.status).toBe(404);
            expect(text).toBe(
                JSON.stringify({
                    error: "Tarefa não encontrada",
                })
            );
        });

        it("should return 401 if user is not authenticated", async () => {
            // Arrange: Mock session
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/tasks/${mockTask.id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Act: Call handler with standard Request
            const response = await GET(req, {
                params: { taskId: mockTask.id },
            });
            const text = await response.text(); // Check text for non-JSON error response

            // Assert
            expect(response.status).toBe(401);
            expect(text).toBe(
                JSON.stringify({
                    error: "Não autorizado",
                })
            );
        });
    });

    // --- PATCH /api/tasks/[taskId] ---
    describe("PATCH", () => {
        const updateData = {
            name: "Updated Task Name",
            status: Status.IN_PROGRESS,
            startDate: new Date("2024-02-01T00:00:00.000Z"), // Ensure valid date
        };

        it("should return 400 if required fields are missing", async () => {
            // Arrange: No prisma mock needed
            const invalidData = { description: "Only description" };
            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/tasks/${mockTask.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(invalidData), // Stringify body
                }
            );

            // Act: Call handler with standard Request
            const response = await PATCH(req, {
                params: { taskId: mockTask.id },
            });
            const text = await response.text(); // Check text for non-JSON error response

            // Assert
            expect(response.status).toBe(400);
            expect(text).toBe(
                JSON.stringify({
                    error: "Nome da tarefa é obrigatório",
                })
            );
        });

        it("should return 401 if user is not authenticated", async () => {
            // Arrange: Mock session
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/tasks/${mockTask.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updateData),
                }
            );

            // Act: Call handler with standard Request
            const response = await PATCH(req, {
                params: { taskId: mockTask.id },
            });
            const text = await response.text(); // Check text for non-JSON error response

            // Assert
            expect(response.status).toBe(401);
            expect(text).toBe(
                JSON.stringify({
                    error: "Não autorizado",
                })
            );
        });
    });

    // --- DELETE /api/tasks/[taskId] ---
    describe("DELETE", () => {
        it("should return 401 if user is not authenticated", async () => {
            // Arrange: Mock session
            (getServerSession as jest.Mock).mockResolvedValue(null);

            // Arrange: Create standard Request object
            const req = new Request(
                `http://localhost/api/tasks/${mockTask.id}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                }
            );

            // Act: Call handler with standard Request
            const response = await DELETE(req, {
                params: { taskId: mockTask.id },
            });
            const text = await response.text(); // Check text for non-JSON error response

            // Assert
            expect(response.status).toBe(401);
            expect(text).toBe(
                JSON.stringify({
                    error: "Não autorizado",
                })
            );
        });
    });
});
