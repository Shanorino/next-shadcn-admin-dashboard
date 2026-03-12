import type { Config } from "jest"

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",

    roots: [
        "<rootDir>/src",
        "<rootDir>/tests"
    ],

    testMatch: [
        "**/*.test.ts",
        "**/*.spec.ts"
    ],

    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },

    clearMocks: true
}

export default config
