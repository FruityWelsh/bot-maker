/**
 * BotCredential CRD Schema Validation Wrapper
 * References: features/chatbot.feature
 * Uses AJV for JSON Schema validation
 */

const Ajv = require('ajv');
const botcredentialCrdSchema = require('./botcredential-crd.json');

// Create AJV instance with custom formats
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: true
});

// Add custom formats
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('dateTime', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?$/);
ajv.addFormat('uri', /^https?:\/\/.+/i);

// Add the schema to AJV
const validate = ajv.compile(botcredentialCrdSchema);

/**
 * Validate BotCredential CRD against schema
 * @param {Object} botcredentialCrd - BotCredential CRD to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateBotCredential(botcredentialCrd) {
  const result = validate(botcredentialCrd);
  
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
  validate: validateBotCredential,
  schema: botcredentialCrdSchema
};