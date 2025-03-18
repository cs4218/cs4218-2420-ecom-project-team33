export default { // do not change
  // display name
  displayName: "integration",

  setupFiles: ["<rootDir>/jest.setup.js"], 

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/integration-tests/*.test.js"],

  transform: {},

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/*.js", "!controllers/*.test.js"],
  coverageThreshold: {
    global: {
      lines: 0,
      functions: 0,
    },
  },
};