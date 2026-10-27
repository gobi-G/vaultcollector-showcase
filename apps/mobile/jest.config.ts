import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@vault-collector/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { strict: true } }],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
};

export default config;
