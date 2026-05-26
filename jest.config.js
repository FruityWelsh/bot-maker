/**
 * Jest configuration for ChatBot Operator
 * References: features/chatbot.feature (upstream)
 * 
 * This configuration ensures Jest can find and run all test files
 * in the tests/ directory structure.
 */

module.exports = {
  // Tell Jest to look for test files in the tests/ directory
  testMatch: [
    "**/tests/**/*.js"
  ],
  
  // Ignore node_modules
  testPathIgnorePatterns: [
    "/node_modules/"
  ],
  
  // Use Node.js environment
  testEnvironment: "node",
  
  // Verbose output
  verbose: true
};
