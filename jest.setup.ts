// Remove @testing-library/jest-dom import
// import "@testing-library/jest-dom";

// Remove whatwg-fetch import
// import "whatwg-fetch";

// Remove the manual mock for next/server
// jest.mock("next/server", () => { ... });

// Mock Next.js router
jest.mock("next/router", () => ({
    useRouter() {
        return {
            route: "/",
            pathname: "",
            query: {},
            asPath: "",
            push: jest.fn(),
            replace: jest.fn(),
            reload: jest.fn(),
            back: jest.fn(),
            prefetch: jest.fn(),
            beforePopState: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn(),
            },
            isFallback: false,
        };
    },
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        replace: jest.fn(),
        refresh: jest.fn(),
        back: jest.fn(),
        prefetch: jest.fn(),
        forward: jest.fn(),
    }),
    useSearchParams: jest.fn(() => new URLSearchParams()),
    usePathname: jest.fn(() => "/"),
}));

// Mock next-auth
jest.mock("next-auth/react", () => ({
    useSession: jest.fn(() => ({
        data: null,
        status: "unauthenticated",
    })),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
}));

// Suppress console errors during tests
beforeAll(() => {
    console.error = jest.fn();
});

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
});
