/**
 * Gherkin Schema Validation Wrapper
 * References: features/chatbot.feature
 * Uses AJV for JSON Schema validation
 */

const Ajv = require('ajv');
const gherkinSchema = require('./gherkin-schema.json');

// Create AJV instance with custom formats
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: true
});

// Add custom formats
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('uri', /^https?:\/\/.+/i);

// Add the schema to AJV
const validate = ajv.compile(gherkinSchema);

/**
 * Validate Gherkin document against schema
 * @param {Object} gherkinDocument - Gherkin document to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateGherkin(gherkinDocument) {
  const result = validate(gherkinDocument);
  
  if (result) {
    return {
      valid: true,
      errors: null
    };
  } else {
    return {
      valid: false,
      errors: validate.errors.map(error => ({
        instancePath: error.instancePath,
        message: error.message,
        params: error.params,
        schemaPath: error.schemaPath
      }))
    };
  }
}

module.exports = {
  validate: validateGherkin,
  schema: gherkinSchema
};