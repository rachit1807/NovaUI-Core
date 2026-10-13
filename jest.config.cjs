module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: { '\\.(css)$': '<rootDir>/src/test/styleMock.cjs' },
  collectCoverageFrom: ['src/components/**/*.jsx', 'src/lib/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],
  coverageThreshold: { global: { branches: 85, functions: 90, lines: 90, statements: 90 } },
  clearMocks: true
};
