/**
 * ADR Schema Validation Wrapper
 * References: docs/adr/architecture-decisions.md
 * Uses AJV for JSON Schema validation
 */

const Ajv = require('ajv');
const adrSchema = require('./adr-schema.json');

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
const validate = ajv.compile(adrSchema);

/**
 * Validate ADR document against schema
 * @param {Object} adrDocument - ADR document to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateAdr(adrDocument) {
  const result = validate(adrDocument);
  
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
  validate: validateAdr,
  schema: adrSchema
};