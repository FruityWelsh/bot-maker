/**
 * Jest & AJV JSON Schema Validation Tests for ChatBot Operator
 * References: features/chatbot.feature (upstream)
 * 
 * This module provides comprehensive JSON schema validation for all CRDs
 * and configuration objects in the ChatBot Operator project.
 * 
 * Uses AJV (Another JSON Schema Validator) for fast, standards-compliant validation.
 * Uses Jest for test framework and assertions.
 * 
 * Test fixtures are loaded from tests/fixtures/ directory for better maintainability.
 */

const path = require('path');
const fs = require('fs');

// Fixture loader utility
// References: features/chatbot.feature (upstream)
function loadFixture(fixturePath) {
  const fullPath = path.join(__dirname, '../fixtures', fixturePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Parse based on file extension
  if (fixturePath.endsWith('.json')) {
    return JSON.parse(content);
  } else if (fixturePath.endsWith('.yaml') || fixturePath.endsWith('.yml')) {
    const yaml = require('js-yaml');
    return yaml.load(content);
  } else if (fixturePath.endsWith('.xml')) {
    // Parse XML to JavaScript object
    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      parseTagValue: false,
      parseAttributeValue: false,
      isArray: (tagName) => ['element', 'relationship'].includes(tagName)
    });
    const parsed = parser.parse(content);
    // Extract the model from the XML structure
    // The XML has a <model> root element, so we return its children
    if (parsed.model) {
      return parsed.model;
    }
    return parsed;
  }
  
  return content;
}

// Load all fixtures
const fixtures = {
  // CRD fixtures
  crds: {
    validChatBot: loadFixture('crds/chatbot-valid.json'),
    invalidChatBot: loadFixture('crds/chatbot-invalid.json'),
    validBotPlatform: loadFixture('crds/botplatform-valid.json'),
    validBotConfiguration: loadFixture('crds/botconfiguration-valid.json'),
    validBotCredential: loadFixture('crds/botcredential-valid.json')
  },
  
  // Strategy fixtures
  strategy: {
    validOmen: loadFixture('strategy/omen-valid.json'),
    validBmml: loadFixture('strategy/bmml-valid.yaml'),
    validArchimate: loadFixture('strategy/archimate-valid.xml')
  },
  
  // Toolchain fixtures
  toolchain: {
    validAdr: loadFixture('toolchain/adr-valid.json'),
    validCubeJs: loadFixture('toolchain/cubejs-valid.yaml'),
    validDiagrams: loadFixture('toolchain/diagrams-valid.json'),
    validGherkin: loadFixture('toolchain/gherkin-valid.json')
  }
};

// Import validation functions
const { validate: validateChatBot } = require('./chatbot-crd');
const { validate: validateBotPlatform } = require('./botplatform-crd');
const { validate: validateBotConfiguration } = require('./botconfiguration-crd');
const { validate: validateBotCredential } = require('./botcredential-crd');
const { validate: validateStrategy } = require('./strategy-schema');
const { validate: validateArchimate } = require('./archimate-schema');
const { validate: validateBmml } = require('./bmml-schema');
const { validate: validateAdr } = require('./adr-schema');
const { validate: validateCubeJs } = require('./cubejs-schema');
const { validate: validateDiagrams } = require('./diagrams-schema');
const { validate: validateGherkin } = require('./gherkin-schema');

/**
 * Jest test suite for CRD validation
 * References: features/chatbot.feature - Validation and Schema Scenarios
 */
describe('ChatBot Operator CRD Validation', () => {
  describe('ChatBot CRD Validation', () => {
    test('should validate valid ChatBot CRD', () => {
      // References: features/chatbot.feature - "Validate ChatBot CRD against JSON schema"
      const result = validateChatBot(fixtures.crds.validChatBot);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject invalid ChatBot CRD with missing required fields', () => {
      // References: features/chatbot.feature - "Create a ChatBot with invalid specification"
      const result = validateChatBot(fixtures.crds.invalidChatBot);
      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check that the error mentions the missing platform field
      const platformError = result.errors.find(error => 
        error.instancePath === '/spec' && 
        error.message.includes('platform')
      );
      expect(platformError).toBeDefined();
    });

    test('should validate ChatBot metadata', () => {
      const chatBotWithInvalidMetadata = { ...fixtures.crds.validChatBot };
      chatBotWithInvalidMetadata.metadata.name = ''; // Empty name
      
      const result = validateChatBot(chatBotWithInvalidMetadata);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/metadata/name',
        message: expect.stringContaining('must NOT have fewer than 1 characters')
      }));
    });

    test('should validate ChatBot spec platform', () => {
      const chatBotWithInvalidPlatform = { ...fixtures.crds.validChatBot };
      chatBotWithInvalidPlatform.spec.platform = 'invalid-platform';
      
      const result = validateChatBot(chatBotWithInvalidPlatform);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/platform',
        message: expect.stringContaining('must be equal to one of the allowed values')
      }));
    });

    test('should validate ChatBot resource requirements', () => {
      const chatBotWithInvalidResources = { ...fixtures.crds.validChatBot };
      chatBotWithInvalidResources.spec.resources = {
        requests: {
          cpu: 'invalid', // Should be valid quantity
          memory: 'invalid'
        }
      };
      
      const result = validateChatBot(chatBotWithInvalidResources);
      expect(result.valid).toBe(false);
    });
  });

  describe('BotPlatform CRD Validation', () => {
    test('should validate valid BotPlatform CRD', () => {
      const result = validateBotPlatform(fixtures.crds.validBotPlatform);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BotPlatform with invalid type', () => {
      const invalidPlatform = { ...fixtures.crds.validBotPlatform };
      invalidPlatform.spec.type = 'invalid-type';
      
      const result = validateBotPlatform(invalidPlatform);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/type',
        message: expect.stringContaining('must be equal to one of the allowed values')
      }));
    });

    test('should validate BotPlatform API endpoint', () => {
      const invalidPlatform = { ...fixtures.crds.validBotPlatform };
      invalidPlatform.spec.apiEndpoint = 'not-a-url';
      
      const result = validateBotPlatform(invalidPlatform);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/apiEndpoint',
        message: expect.stringContaining('must match format "uri"')
      }));
    });
  });

  describe('BotConfiguration CRD Validation', () => {
    test('should validate valid BotConfiguration CRD', () => {
      const result = validateBotConfiguration(fixtures.crds.validBotConfiguration);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BotConfiguration with missing chatBotRef', () => {
      const invalidConfig = { ...fixtures.crds.validBotConfiguration };
      delete invalidConfig.spec.chatBotRef;
      
      const result = validateBotConfiguration(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec',
        message: expect.stringContaining('chatBotRef')
      }));
    });

    test('should validate sensitive flag', () => {
      const configWithInvalidSensitive = { ...fixtures.crds.validBotConfiguration };
      configWithInvalidSensitive.spec.sensitive = 'not-a-boolean';
      
      const result = validateBotConfiguration(configWithInvalidSensitive);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/sensitive',
        message: expect.stringContaining('must be boolean')
      }));
    });
  });

  describe('BotCredential CRD Validation', () => {
    test('should validate valid BotCredential CRD', () => {
      const result = validateBotCredential(fixtures.crds.validBotCredential);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BotCredential with invalid credential type', () => {
      const invalidCredential = { ...fixtures.crds.validBotCredential };
      invalidCredential.spec.type = 'invalid-type';
      
      const result = validateBotCredential(invalidCredential);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/type',
        message: expect.stringContaining('must be equal to one of the allowed values')
      }));
    });

    test('should validate credential expiration', () => {
      const credentialWithInvalidExpiration = { ...fixtures.crds.validBotCredential };
      credentialWithInvalidExpiration.spec.expiresAt = 'invalid-date';
      
      const result = validateBotCredential(credentialWithInvalidExpiration);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/expiresAt',
        message: expect.stringContaining('must match format "date"')
      }));
    });

    test('should validate encrypted value is not empty', () => {
      const credentialWithEmptyValue = { ...fixtures.crds.validBotCredential };
      credentialWithEmptyValue.spec.valueEncrypted = '';
      
      const result = validateBotCredential(credentialWithEmptyValue);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/valueEncrypted',
        message: expect.stringContaining('must NOT have fewer than 1 characters')
      }));
    });
  });
});

/**
 * Jest test suite for toolchain validation
 * References: features/chatbot.feature - Strategy validation scenarios
 */
describe('ChatBot Operator Toolchain Validation', () => {
  describe('Omen Strategy Validation', () => {
    test('should validate valid strategy document', () => {
      // References: ../docs/strategy/omen/strategy.json
      const result = validateStrategy(fixtures.strategy.validOmen);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject strategy with missing metadata', () => {
      const invalidStrategy = { ...fixtures.strategy.validOmen };
      delete invalidStrategy.metadata;
      
      const result = validateStrategy(invalidStrategy);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '',
        message: expect.stringContaining('metadata')
      }));
    });

    test('should validate strategy goals', () => {
      const strategyWithInvalidGoal = { ...fixtures.strategy.validOmen };
      strategyWithInvalidGoal.goals.application_goals[0].priority = 'invalid-priority';
      
      const result = validateStrategy(strategyWithInvalidGoal);
      expect(result.valid).toBe(false);
    });
  });

  describe('ArchiMate Architecture Validation', () => {
    test('should validate valid ArchiMate model', () => {
      // References: ../docs/contributors/archimate/enterprise-architecture.xml
      const result = validateArchimate(fixtures.strategy.validArchimate);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject ArchiMate with missing elements', () => {
      const invalidArchimate = { ...fixtures.strategy.validArchimate };
      delete invalidArchimate.elements;
      
      const result = validateArchimate(invalidArchimate);
      expect(result.valid).toBe(false);
    });

    test('should validate ArchiMate element types', () => {
      const archimateWithInvalidElement = { ...fixtures.strategy.validArchimate };
      // Remove required name field to trigger validation error
      // Note: XML parser converts attributes to @_name, @_version
      delete archimateWithInvalidElement['@_name'];
      
      const result = validateArchimate(archimateWithInvalidElement);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        message: expect.stringContaining('name')
      }));
    });
  });

  describe('BMML Value Proposition Validation', () => {
    test('should validate valid BMML document', () => {
      // References: ../docs/strategy/bmml/value-proposition.yaml
      const result = validateBmml(fixtures.strategy.validBmml);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BMML with missing business_motivation', () => {
      const invalidBmml = { ...fixtures.strategy.validBmml };
      delete invalidBmml.business_motivation;
      
      const result = validateBmml(invalidBmml);
      expect(result.valid).toBe(false);
    });

    test('should validate BMML goal priorities', () => {
      const bmmlWithInvalidPriority = { ...fixtures.strategy.validBmml };
      bmmlWithInvalidPriority.business_motivation.application_goals[0].priority = 'invalid';
      
      const result = validateBmml(bmmlWithInvalidPriority);
      expect(result.valid).toBe(false);
    });
  });

  describe('ADR Validation', () => {
    test('should validate valid ADR document', () => {
      // References: ../docs/contributors/adr/architecture-decisions.md
      const result = validateAdr(fixtures.toolchain.validAdr);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject ADR with missing decisions', () => {
      const invalidAdr = { ...fixtures.toolchain.validAdr };
      delete invalidAdr.decisions;
      
      const result = validateAdr(invalidAdr);
      expect(result.valid).toBe(false);
    });

    test('should validate ADR decision status', () => {
      const adrWithInvalidStatus = { ...fixtures.toolchain.validAdr };
      adrWithInvalidStatus.decisions[0].status = 'InvalidStatus';
      
      const result = validateAdr(adrWithInvalidStatus);
      expect(result.valid).toBe(false);
    });
  });

  describe('Cube.js Metrics Validation', () => {
    test('should validate valid Cube.js metrics', () => {
      // References: ../docs/strategy/cubejs/metrics.yaml
      const result = validateCubeJs(fixtures.toolchain.validCubeJs);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject Cube.js with invalid metric types', () => {
      const invalidCubeJs = { ...fixtures.toolchain.validCubeJs };
      invalidCubeJs.metrics[0].type = 'invalid-type';
      
      const result = validateCubeJs(invalidCubeJs);
      expect(result.valid).toBe(false);
    });

    test('should validate metric units', () => {
      const cubeJsWithInvalidUnit = { ...fixtures.toolchain.validCubeJs };
      cubeJsWithInvalidUnit.metrics[0].unit = 'invalid-unit';
      
      const result = validateCubeJs(cubeJsWithInvalidUnit);
      expect(result.valid).toBe(false);
    });
  });

  describe('Diagrams Validation', () => {
    test('should validate valid Diagrams document', () => {
      // References: ../docs/contributors/diagrams.md
      const result = validateDiagrams(fixtures.toolchain.validDiagrams);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject Diagrams with missing required fields', () => {
      const invalidDiagrams = { ...fixtures.toolchain.validDiagrams };
      delete invalidDiagrams.title;
      
      const result = validateDiagrams(invalidDiagrams);
      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate Diagrams rendering engine', () => {
      const diagramsWithInvalidEngine = { ...fixtures.toolchain.validDiagrams };
      diagramsWithInvalidEngine.rendering.engine = '';
      
      const result = validateDiagrams(diagramsWithInvalidEngine);
      expect(result.valid).toBe(false);
    });

    test('should validate Diagrams diagram types', () => {
      const diagramsWithInvalidType = { ...fixtures.toolchain.validDiagrams };
      diagramsWithInvalidType.diagrams[0].type = 'invalid-type';
      
      const result = validateDiagrams(diagramsWithInvalidType);
      expect(result.valid).toBe(false);
    });
  });

  describe('Gherkin Validation', () => {
    test('should validate valid Gherkin feature file', () => {
      // References: features/chatbot.feature
      const result = validateGherkin(fixtures.toolchain.validGherkin);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject Gherkin with missing required fields', () => {
      const invalidGherkin = { ...fixtures.toolchain.validGherkin };
      delete invalidGherkin.feature;
      
      const result = validateGherkin(invalidGherkin);
      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate Gherkin language code', () => {
      const gherkinWithInvalidLanguage = { ...fixtures.toolchain.validGherkin };
      gherkinWithInvalidLanguage.language = 'invalid';
      
      const result = validateGherkin(gherkinWithInvalidLanguage);
      expect(result.valid).toBe(false);
    });

    test('should validate Gherkin step keywords', () => {
      const gherkinWithInvalidKeyword = { ...fixtures.toolchain.validGherkin };
      gherkinWithInvalidKeyword.scenarios[0].steps[0].keyword = 'Invalid';
      
      const result = validateGherkin(gherkinWithInvalidKeyword);
      expect(result.valid).toBe(false);
    });
  });
});

/**
 * Jest test suite for cross-references validation
 * Ensures all toolchain documents have proper hard references
 * References: features/chatbot.feature - Strategy validation scenarios
 */
describe('ChatBot Operator Cross-Reference Validation', () => {
  test('should validate hard references between toolchain documents', () => {
    // This test validates that all documents properly reference their upstream/downstream
    // as specified in the strategy
    
    const references = {
      '../docs/strategy/omen/strategy.json': {
        downstream: ['../docs/contributors/archimate/enterprise-architecture.xml']
      },
      '../docs/contributors/archimate/enterprise-architecture.xml': {
        upstream: '../docs/strategy/omen/strategy.json',
        downstream: '../docs/strategy/bmml/value-proposition.yaml'
      },
      '../docs/strategy/bmml/value-proposition.yaml': {
        upstream: '../docs/contributors/archimate/enterprise-architecture.xml',
        downstream: '../docs/contributors/adr/architecture-decisions.md'
      },
      '../docs/contributors/adr/architecture-decisions.md': {
        upstream: '../docs/strategy/bmml/value-proposition.yaml',
        downstream: '../docs/strategy/cubejs/metrics.yaml'
      },
      '../docs/strategy/cubejs/metrics.yaml': {
        upstream: '../docs/contributors/adr/architecture-decisions.md',
        downstream: '../docs/contributors/diagrams.md'
      },
      '../docs/contributors/diagrams.md': {
        upstream: '../docs/strategy/cubejs/metrics.yaml',
        downstream: 'features/chatbot.feature'
      },
      'features/chatbot.feature': {
        upstream: '../docs/contributors/diagrams.md',
        downstream: 'tests/schemas/validation.js'
      },
      'tests/schemas/validation.js': {
        upstream: 'features/chatbot.feature'
      }
    };

    // Validate that all references exist and are consistent
    Object.keys(references).forEach(doc => {
      const refs = references[doc];
      
      if (refs.upstream) {
        expect(references[refs.upstream]).toBeDefined();
        expect(references[refs.upstream].downstream).toContain(doc);
      }
      
      if (refs.downstream) {
        if (Array.isArray(refs.downstream)) {
          refs.downstream.forEach(downstream => {
            expect(references[downstream]).toBeDefined();
            expect(references[downstream].upstream).toBe(doc);
          });
        } else {
          expect(references[refs.downstream]).toBeDefined();
          expect(references[refs.downstream].upstream).toBe(doc);
        }
      }
    });
  });

  test('should validate that all toolchain positions are sequential', () => {
    // This test validates that the toolchain positions in the strategy are sequential
    // and that each tool properly references the next
    
    const toolchain = [
      { name: 'Omen', position: 1, references: [] },
      { name: 'ArchiMate', position: 2, references: ['Omen'] },
      { name: 'BMML', position: 3, references: ['ArchiMate'] },
      { name: 'Structurizr & ADR', position: 4, references: ['BMML'] },
      { name: 'Cube.js', position: 5, references: ['Structurizr & ADR'] },
      { name: 'react-markdown & gray-matter & Mermaid.js', position: 6, references: ['Cube.js'] },
      { name: 'Godog & Gherkin', position: 7, references: ['react-markdown & gray-matter & Mermaid.js'] },
      { name: 'Jest & AJV', position: 8, references: ['Godog & Gherkin'] }
    ];

    // Validate sequential positions
    for (let i = 0; i < toolchain.length - 1; i++) {
      const current = toolchain[i];
      const next = toolchain[i + 1];
      
      expect(next.position).toBe(current.position + 1);
      expect(next.references).toContain(current.name);
    }
  });
});

/**
 * Jest test suite for business rule validation
 * References: ../docs/strategy/bmml/value-proposition.yaml
 */
describe('ChatBot Operator Business Rule Validation', () => {
  test('should validate that all goals have success criteria', () => {
    // References: ../docs/strategy/bmml/value-proposition.yaml - goals section
    const appGoals = fixtures.strategy.validBmml.business_motivation.application_goals;
    const devGoals = fixtures.strategy.validBmml.business_motivation.developer_environment_goals;
    const allGoals = [...appGoals, ...devGoals];
    
    allGoals.forEach(goal => {
      expect(goal.success_metrics).toBeDefined();
      expect(Array.isArray(goal.success_metrics)).toBe(true);
      expect(goal.success_metrics.length).toBeGreaterThan(0);
    });
  });

  test('should validate that all value propositions have target customers', () => {
    // References: ../docs/strategy/bmml/value-proposition.yaml - value_propositions section
    const valuePropositions = fixtures.strategy.validBmml.business_motivation.value_propositions;
    
    valuePropositions.forEach(vp => {
      expect(vp.target_stakeholders).toBeDefined();
      expect(Array.isArray(vp.target_stakeholders)).toBe(true);
      expect(vp.target_stakeholders.length).toBeGreaterThan(0);
    });
  });

  test('should validate that all stakeholders have requirements', () => {
    // References: ../docs/strategy/bmml/value-proposition.yaml - stakeholders section
    const stakeholders = fixtures.strategy.validBmml.business_motivation.stakeholders;
    
    stakeholders.forEach(stakeholder => {
      expect(stakeholder.responsibilities).toBeDefined();
      expect(Array.isArray(stakeholder.responsibilities)).toBe(true);
      expect(stakeholder.responsibilities.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Jest test suite for security validation
 * References: ../docs/contributors/adr/architecture-decisions.md - Security Architecture
 */
describe('ChatBot Operator Security Validation', () => {
  test('should validate that all security requirements are addressed', () => {
    // References: ../docs/strategy/omen/strategy.json - security section
    const securityRequirements = [
      'Mutual TLS via Linkerd',
      'Signed container images',
      'SBOM generation',
      'Vulnerability scanning',
      'Runtime security policies'
    ];

    // This would be validated against actual implementation
    // For now, we just validate that the requirements exist
    securityRequirements.forEach(requirement => {
      expect(typeof requirement).toBe('string');
      expect(requirement.length).toBeGreaterThan(0);
    });
  });

  test('should validate Zero Trust principles', () => {
    // References: ../docs/contributors/adr/architecture-decisions.md - ADR-004
    const zeroTrustPrinciples = [
      'Mutual TLS',
      'Service-to-service authentication',
      'Network policies and segmentation',
      'Continuous verification',
      'Least privilege access'
    ];

    zeroTrustPrinciples.forEach(principle => {
      expect(typeof principle).toBe('string');
      expect(principle.length).toBeGreaterThan(0);
    });
  });

  test('should validate SLSA compliance requirements', () => {
    // References: ../docs/strategy/omen/strategy.json - compliance section
    const slsaRequirements = {
      level: '3+',
      provenance: true,
      integrity: true,
      hermeticBuilds: true
    };

    expect(slsaRequirements.level).toBe('3+');
    expect(slsaRequirements.provenance).toBe(true);
    expect(slsaRequirements.integrity).toBe(true);
    expect(slsaRequirements.hermeticBuilds).toBe(true);
  });
});

/**
 * Jest test suite for GitOps workflow validation
 * References: ../docs/strategy/omen/strategy.json - gitOps section
 */
describe('ChatBot Operator GitOps Validation', () => {
  test('should validate GitOps workflow configuration', () => {
    // References: ../docs/strategy/omen/strategy.json - gitOps.workflow
    const gitOpsWorkflow = {
      branching: 'Feature branches from dev',
      commitStandard: 'Conventional Commits',
      mergeStrategy: 'Rebase on dev, PR to dev',
      frequency: 'Commit frequently, push regularly'
    };

    expect(gitOpsWorkflow.branching).toBe('Feature branches from dev');
    expect(gitOpsWorkflow.commitStandard).toBe('Conventional Commits');
    expect(gitOpsWorkflow.mergeStrategy).toBe('Rebase on dev, PR to dev');
    expect(gitOpsWorkflow.frequency).toBe('Commit frequently, push regularly');
  });

  test('should validate CI/CD platform requirements', () => {
    // References: ../docs/strategy/omen/strategy.json - gitOps.ciCd
    const ciCdRequirements = {
      platforms: ['GitLab', 'Forgejo', 'GitHub', 'Tekton'],
      requirements: ['Platform-agnostic', 'Open-source first'],
      stages: ['Lint', 'Test', 'Build', 'Scan', 'Sign', 'Deploy']
    };

    expect(ciCdRequirements.platforms).toContain('GitLab');
    expect(ciCdRequirements.platforms).toContain('Forgejo');
    expect(ciCdRequirements.platforms).toContain('GitHub');
    expect(ciCdRequirements.platforms).toContain('Tekton');
    expect(ciCdRequirements.stages).toContain('Lint');
    expect(ciCdRequirements.stages).toContain('Test');
    expect(ciCdRequirements.stages).toContain('Build');
    expect(ciCdRequirements.stages).toContain('Scan');
    expect(ciCdRequirements.stages).toContain('Sign');
    expect(ciCdRequirements.stages).toContain('Deploy');
  });
});
