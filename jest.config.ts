import type { Config } from "jest";
import nextJest from "next/jest";
import { join } from "path";

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.(ts|tsx)$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
            },
        ],
    },
    moduleDirectories: ["node_modules", "<rootDir>"],
    moduleNameMapper: {
        "^@/(.*)$": join(__dirname, "src/$1"),
    },
    coverageDirectory: "coverage",
    collectCoverageFrom: [
        "src/**/*.{js,jsx,ts,tsx}",
        "!src/**/*.d.ts",
        "!src/**/types.ts",
        "!src/**/*.stories.{js,jsx,ts,tsx}",
        "!src/**/index.{js,ts}",
        "!src/**/*.test.{js,jsx,ts,tsx}",
    ],
    testPathIgnorePatterns: [
        "<rootDir>/node_modules/",
        "<rootDir>/.next/",
        "<rootDir>/coverage/",
    ],
    testEnvironmentOptions: {
        customExportConditions: [""],
    },
    projects: [
        {
            displayName: "components",
            testMatch: ["<rootDir>/src/components/**/*.test.{js,jsx,ts,tsx}"],
            testEnvironment: "jsdom",
            transform: {
                "^.+\\.(ts|tsx)$": [
                    "ts-jest",
                    {
                        tsconfig: "tsconfig.json",
                    },
                ],
            },
            moduleDirectories: ["node_modules", "<rootDir>"],
            moduleNameMapper: {
                "^@/(.*)$": join(__dirname, "src/$1"),
            },
        },
        {
            displayName: "api",
            testMatch: ["<rootDir>/src/app/api/**/*.spec.{js,jsx,ts,tsx}"],
            testEnvironment: "node",
            transform: {
                "^.+\\.(ts|tsx)$": [
                    "ts-jest",
                    {
                        tsconfig: "tsconfig.json",
                    },
                ],
            },
            moduleDirectories: ["node_modules", "<rootDir>"],
            moduleNameMapper: {
                "^@/(.*)$": join(__dirname, "src/$1"),
            },
        },
    ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
