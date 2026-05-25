/**
 * BMML Schema Validation Wrapper
 * References: docs/bmml/value-proposition.yaml
 * Uses AJV for JSON Schema validation
 */

const Ajv = require('ajv');
const bmmlSchema = require('./bmml-schema.json');

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
const validate = ajv.compile(bmmlSchema);

/**
 * Validate BMML document against schema
 * @param {Object} bmmlDocument - BMML document to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateBmml(bmmlDocument) {
  const result = validate(bmmlDocument);
  
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
  validate: validateBmml,
  schema: bmmlSchema
};