/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        // Route handlers use ESM syntax; compile to CommonJS for the Jest runtime.
        tsconfig: { module: 'commonjs', esModuleInterop: true, jsx: 'preserve' },
      },
    ],
  },
};
