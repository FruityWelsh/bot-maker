/**
 * ArchiMate Schema Validation Wrapper
 * References: docs/archimate/enterprise-architecture.xml
 * Uses simple validation for XML documents
 */

const Ajv = require('ajv');

// Create AJV instance for basic validation
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: true
});

/**
 * Validate ArchiMate document against basic structure
 * @param {Object} archimateDocument - ArchiMate document to validate
 * @returns {Object} Validation result with valid boolean and errors array
 */
function validateArchimate(archimateDocument) {
  // Basic validation - check required fields
  // Note: XML parser with attributeNamePrefix: "@_" converts attributes to @_name, @_version
  // Also check for id field which should be present
  const requiredFields = ['name', 'version', 'id'];
  const errors = [];
  
  // Check if document has any properties at all
  const hasAnyProperties = Object.keys(archimateDocument).length > 0;
  if (!hasAnyProperties) {
    errors.push({
      instancePath: '',
      message: 'ArchiMate document is empty or not parsed correctly',
      params: {},
      schemaPath: '#'
    });
  }
  
  for (const field of requiredFields) {
    // XML parser converts attributes to @_name, @_version
    const prefixedField = `@_${field}`;
    const hasField = field in archimateDocument;
    const hasPrefixedField = prefixedField in archimateDocument;
    
    // Also check if any key contains the field name (for debugging)
    const hasFieldInKeys = Object.keys(archimateDocument).some(key => key.includes(field));
    
    if (!hasField && !hasPrefixedField) {
      errors.push({
        instancePath: '',
        message: `Missing required field: ${field}. Available keys: ${Object.keys(archimateDocument).join(', ')}`,
        params: { missingProperty: field },
        schemaPath: `#/required/${requiredFields.indexOf(field)}`
      });
    }
  }
  
  // Check for elements if present
  if (archimateDocument.elements && !Array.isArray(archimateDocument.elements)) {
    errors.push({
      instancePath: '/elements',
      message: 'elements must be an array',
      params: { type: 'array' },
      schemaPath: '#/properties/elements/type'
    });
  }
  
  // Check for relationships if present
  if (archimateDocument.relationships && !Array.isArray(archimateDocument.relationships)) {
    errors.push({
      instancePath: '/relationships',
      message: 'relationships must be an array',
      params: { type: 'array' },
      schemaPath: '#/properties/relationships/type'
    });
  }
  
  if (errors.length === 0) {
    return {
      valid: true,
      errors: null
    };
  } else {
    return {
      valid: false,
      errors: errors
    };
  }
}

module.exports = {
  validate: validateArchimate,
  xsd: 'ArchiMate XSD validation requires fast-xml-parser dependency'
};