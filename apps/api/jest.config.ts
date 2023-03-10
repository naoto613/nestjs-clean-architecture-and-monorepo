/* eslint-disable */
export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],
  coverageDirectory: '../../coverage/apps/api',
  collectCoverageFrom: [
    '**/*.{tsx,ts}',
    '!jest.config.ts',
    '!src/main.ts',
    '!**/*.dto.ts',
    '!./src/infrastructure/prisma/**/*',
    '!./src/infrastructure/plugins/**/*',
    '!./src/infrastructure/graphql/**/*',
  ],
}
