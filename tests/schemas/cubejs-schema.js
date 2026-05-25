/**
 * Cube.js Schema Validation Wrapper
 * References: docs/cubejs/metrics.yaml
 * Uses AJV for JSON Schema validation
 */

const Ajv = require('ajv');
const cubejsSchema = require('./cubejs-schema.json');

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
const validate = ajv.compile(cubejsSchema);

/**
 * Validate Cube.js document against schema
 * @param {Object} cubejsDocument - Cube.js document to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateCubeJs(cubejsDocument) {
  const result = validate(cubejsDocument);
  
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
  validate: validateCubeJs,
  schema: cubejsSchema
};