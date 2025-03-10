export default { // do not change
  // display name
  displayName: "backend",

  setupFiles: ["<rootDir>/jest.setup.js"], 

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/*.test.js"],

  transform: {},

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
      lines: 0,
      functions: 0,
    },
  },
};
