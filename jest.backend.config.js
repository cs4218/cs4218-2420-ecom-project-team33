<<<<<<< HEAD
module.exports = {
  // display name
  displayName: "backend",

=======
export default {
  // display name
  displayName: "backend",

  setupFiles: ["<rootDir>/jest.setup.js"], 

>>>>>>> 5d533e8109c8abde0c8234ff427ed51494de2617
  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/*.test.js"],

<<<<<<< HEAD
=======
  transform: {},

>>>>>>> 5d533e8109c8abde0c8234ff427ed51494de2617
  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
<<<<<<< HEAD
      lines: 100,
      functions: 100,
=======
      lines: 0,
      functions: 0,
>>>>>>> 5d533e8109c8abde0c8234ff427ed51494de2617
    },
  },
};
