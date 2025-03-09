module.exports = {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/pages/Auth/*.test.js",
    "<rootDir>/client/src/pages/admin/*.test.js",
    "<rootDir>/client/src/pages/Contact.test.js",
    "<rootDir>/client/src/pages/HomePage.test.js",
    "<rootDir>/client/src/pages/ProductDetails.test.js",
    "<rootDir>/client/src/pages/About.test.js",
    "<rootDir>/client/src/components/*.test.js",
    "<rootDir>/client/src/components/Form/*.test.js",
    "<rootDir>/client/src/**/*.test.js"
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/Auth/**",
    "client/src/pages/admin/**",
    "client/src/components/Form/CategoryForm.js",
    "client/src/components/AdminMenu.js",
    "client/src/pages/Contact.js",
    "client/src/pages/HomePage.js",
    "client/src/pages/ProductDetails.js",
    "client/src/pages/About.js",
    "client/src/**/*.{js,jsx}", "!client/src/_site/**"
  ],
  coverageThreshold: {
    global: {
      lines: 0, // update as test coverage increases
      functions: 0, // update as test coverage increases
    },
  },
};
