/**
 * ChatBot CRD Schema Validation Wrapper
 * References: features/chatbot.feature
 * Uses AJV for JSON Schema validation
 */

const Ajv = require('ajv');
const chatbotCrdSchema = require('./chatbot-crd.json');

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
const validate = ajv.compile(chatbotCrdSchema);

/**
 * Validate ChatBot CRD against schema
 * @param {Object} chatbotCrd - ChatBot CRD to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateChatBot(chatbotCrd) {
  const result = validate(chatbotCrd);
  
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
  validate: validateChatBot,
  schema: chatbotCrdSchema
};