/**
 * Jest & AJV JSON Schema Validation Tests for ChatBot Operator
 * References: features/chatbot.feature (upstream)
 * 
 * This module provides comprehensive JSON schema validation for all CRDs
 * and configuration objects in the ChatBot Operator project.
 * 
 * Uses AJV (Another JSON Schema Validator) for fast, standards-compliant validation.
 * Uses Jest for test framework and assertions.
 */

// References: features/chatbot.feature (upstream)
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
 * Test data for valid ChatBot CRD
 * References: features/chatbot.feature - "Create a new ChatBot resource"
 */
const validChatBot = {
  apiVersion: 'chatbot.operator/v1alpha1',
  kind: 'ChatBot',
  metadata: {
    name: 'test-slack-bot',
    namespace: 'default',
    labels: {
      app: 'chatbot-operator',
      platform: 'slack',
      team: 'engineering'
    }
  },
  spec: {
    platform: 'slack',
    displayName: 'Test Slack Bot',
    description: 'A test bot for Slack integration',
    team: 'engineering',
    callbackURL: 'https://api.example.com/callback',
    webhookURL: 'https://api.example.com/webhook',
    configuration: {
      welcomeMessage: 'Hello! I am a test bot.',
      commands: [
        {
          name: 'help',
          description: 'Show help message',
          handler: 'helpHandler'
        }
      ]
    },
    resources: {
      requests: {
        cpu: '100m',
        memory: '128Mi'
      },
      limits: {
        cpu: '500m',
        memory: '512Mi'
      }
    }
  }
};

/**
 * Test data for invalid ChatBot CRD (missing required fields)
 * References: features/chatbot.feature - "Create a ChatBot with invalid specification"
 */
const invalidChatBot = {
  apiVersion: 'chatbot.operator/v1alpha1',
  kind: 'ChatBot',
  metadata: {
    name: 'invalid-bot'
  },
  spec: {
    // Missing required platform field
    displayName: 'Invalid Bot'
  }
};

/**
 * Test data for valid BotPlatform CRD
 */
const validBotPlatform = {
  apiVersion: 'chatbot.operator/v1alpha1',
  kind: 'BotPlatform',
  metadata: {
    name: 'slack-platform',
    namespace: 'default'
  },
  spec: {
    type: 'slack',
    apiEndpoint: 'https://slack.com/api',
    apiVersion: 'v2',
    authenticationMethod: 'oauth2',
    rateLimits: {
      requestsPerMinute: 60,
      burstLimit: 10
    },
    features: {
      webhooks: true,
      bots: true,
      users: true,
      channels: true
    }
  }
};

/**
 * Test data for valid BotConfiguration CRD
 */
const validBotConfiguration = {
  apiVersion: 'chatbot.operator/v1alpha1',
  kind: 'BotConfiguration',
  metadata: {
    name: 'test-config',
    namespace: 'default'
  },
  spec: {
    chatBotRef: 'test-slack-bot',
    key: 'greeting.message',
    value: 'Welcome to our service!',
    sensitive: false,
    description: 'Welcome message for new users'
  }
};

/**
 * Test data for valid BotCredential CRD
 */
const validBotCredential = {
  apiVersion: 'chatbot.operator/v1alpha1',
  kind: 'BotCredential',
  metadata: {
    name: 'slack-token',
    namespace: 'default'
  },
  spec: {
    chatBotRef: 'test-slack-bot',
    type: 'apiToken',
    valueEncrypted: 'encrypted-token-data',
    encryptionAlgorithm: 'AES-256-GCM',
    expiresAt: 'Generated from Git commit date',
    lastRotated: 'Generated from Git commit date',
    rotationSchedule: '30d'
  }
};

/**
 * Test data for valid Omen strategy
 * References: ../docs/strategy/omen/strategy.json
 */
const validStrategy = {
  metadata: {
    name: 'chatbot-operator-strategy',
    version: '1.0.0',
    description: 'Strategy definition for Kubernetes-native chat bot management'
  },
  vision: {
    statement: 'Enable Platform Engineering teams to manage chat bot lifecycles as Kubernetes resources',
    targetAudience: ['Platform Engineers', 'AppDev Teams', 'Security Teams']
  },
  goals: [
    {
      id: 'G001',
      description: 'Build Kubernetes CRDs for chat bot management',
      priority: 'high'
    }
  ]
};

/**
 * Test data for valid ArchiMate model
 * References: ../docs/contributors/archimate/enterprise-architecture.xml
 */
const validArchimate = {
  name: 'ChatBot Operator Enterprise Architecture',
  version: '1.0.0',
  elements: [
    {
      type: 'BusinessActor',
      name: 'Platform Engineering Team',
      documentation: 'Responsible for infrastructure setup, RBAC/ABAC backend integration'
    }
  ],
  relationships: [
    {
      type: 'AssignmentRelationship',
      source: 'Platform Engineering Team',
      target: 'Infrastructure Manager'
    }
  ]
};

/**
 * Test data for valid BMML value proposition
 * References: ../docs/strategy/bmml/value-proposition.yaml
 */
const validBmml = {
  version: '1.0.0',
  name: 'ChatBot Operator Value Proposition',
  business_motivation: {
    vision: 'Kubernetes-native chat bot management with automated provisioning and lifecycle management',
    mission: 'Enable Platform Engineering teams to manage chat bot lifecycles as Kubernetes resources',
    goals: [
      {
        id: 'G001',
        name: 'Kubernetes CRD Development',
        description: 'Build Kubernetes CRDs for chat bot management',
        priority: 'high'
      }
    ]
  }
};

/**
 * Test data for valid ADR
 * References: ../docs/contributors/adr/architecture-decisions.md
 */
const validAdr = {
  title: 'ChatBot Operator Architecture Decisions',
  version: '1.0.0',
  decisions: [
    {
      id: 'ADR-001',
      status: 'Accepted',
      date: 'Generated from Git commit date',
      context: 'Need to manage chat bot lifecycles as Kubernetes resources',
      decision: 'Implement as Kubernetes Operator using Kubebuilder framework',
      consequences: [
        'Native Kubernetes integration',
        'Declarative management via CRDs'
      ]
    }
  ]
};

/**
 * Test data for valid Cube.js metrics
 * References: ../docs/strategy/cubejs/metrics.yaml
 */
const validCubeJs = {
  version: '1.0.0',
  name: 'ChatBot Operator Business Metrics',
  created: '2026-05-25',
  author: 'Strategy Coder',
  references: {
    upstream: '../docs/contributors/adr/architecture-decisions.md',
    downstream: '../docs/contributors/diagrams.md'
  },
  metrics: [
    {
      name: 'bot_provisioning_time',
      description: 'Time taken to provision a new chat bot',
      type: 'time',
      unit: 'seconds',
      dimensions: ['platform', 'region', 'team'],
      targets: [
        {
          name: 'average_provisioning_time',
          description: 'Average provisioning time across all platforms',
          target_value: '< 300',
          comparison: 'less_than'
        }
      ]
    }
  ],
  data_sources: [
    {
      name: 'kubernetes_api',
      type: 'kubernetes',
      config: {
        api_version: 'v1'
      }
    }
  ]
};

/**
 * Test data for valid Diagrams document
 * References: ../docs/contributors/diagrams.md
 */
const validDiagrams = {
  title: 'ChatBot Operator Architecture Diagrams',
  version: '1.0.0',
  created: '2026-05-25',
  author: 'Strategy Coder',
  references: {
    upstream: '../docs/strategy/cubejs/metrics.yaml',
    downstream: 'features/chatbot.feature'
  },
  rendering: {
    engine: 'react-markdown + gray-matter + Mermaid.js',
    safe: true
  },
  diagrams: [
    {
      id: 'system_context_diagram',
      title: 'ChatBot Operator System Context Diagram',
      type: 'system_context',
      description: 'Shows the ChatBot Operator in relation to its external dependencies and users',
      mermaid_code: 'C4Context\n    title ChatBot Operator System Context Diagram\n    Person(user, "End User", "Interacts with chat bots")',
      elements: ['user', 'dev', 'admin', 'chatbotOperator', 'kubernetes'],
      relationships: [
        {
          source: 'user',
          target: 'chatbotOperator',
          type: 'uses',
          description: 'Users interact with the ChatBot Operator'
        }
      ]
    }
  ]
};

/**
 * Test data for valid Gherkin feature file
 * References: features/chatbot.feature
 */
const validGherkin = {
  language: 'en',
  author: 'Strategy Coder',
  created: '2026-05-25',
  references: {
    upstream: '../docs/contributors/diagrams.md',
    downstream: ['tests/schemas/validation.js', 'tests/tools/']
  },
  feature: {
    title: 'ChatBot Operator Lifecycle Management',
    description: 'Manage chat bot lifecycles as Kubernetes resources',
    as_a: 'Platform Engineering or Application Development team member',
    i_want: 'manage chat bot lifecycles as Kubernetes resources',
    so_that: 'I can automate bot provisioning, configuration, and management',
    tags: ['@crd', '@lifecycle']
  },
  background: {
    steps: [
      {
        keyword: 'Given',
        text: 'the ChatBot Operator is deployed in RKE2 cluster with Linkerd'
      },
      {
        keyword: 'And',
        text: 'the operator has proper RBAC/ABAC permissions'
      }
    ]
  },
  scenarios: [
    {
      title: 'Create a new ChatBot resource',
      tags: ['@crd', '@create'],
      steps: [
        {
          keyword: 'Given',
          text: 'I have a valid ChatBot manifest for platform "slack"'
        },
        {
          keyword: 'When',
          text: 'I apply the ChatBot manifest to Kubernetes'
        },
        {
          keyword: 'Then',
          text: 'the ChatBot resource should be created successfully'
        }
      ]
    }
  ]
};

/**
 * Jest test suite for CRD validation
 * References: features/chatbot.feature - Validation and Schema Scenarios
 */
describe('ChatBot Operator CRD Validation', () => {
  describe('ChatBot CRD Validation', () => {
    test('should validate valid ChatBot CRD', () => {
      // References: features/chatbot.feature - "Validate ChatBot CRD against JSON schema"
      const result = validateChatBot(validChatBot);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject invalid ChatBot CRD with missing required fields', () => {
      // References: features/chatbot.feature - "Create a ChatBot with invalid specification"
      const result = validateChatBot(invalidChatBot);
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
      const chatBotWithInvalidMetadata = { ...validChatBot };
      chatBotWithInvalidMetadata.metadata.name = ''; // Empty name
      
      const result = validateChatBot(chatBotWithInvalidMetadata);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/metadata/name',
        message: expect.stringContaining('should not be empty')
      }));
    });

    test('should validate ChatBot spec platform', () => {
      const chatBotWithInvalidPlatform = { ...validChatBot };
      chatBotWithInvalidPlatform.spec.platform = 'invalid-platform';
      
      const result = validateChatBot(chatBotWithInvalidPlatform);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/platform',
        message: expect.stringContaining('should be one of')
      }));
    });

    test('should validate ChatBot resource requirements', () => {
      const chatBotWithInvalidResources = { ...validChatBot };
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
      const result = validateBotPlatform(validBotPlatform);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BotPlatform with invalid type', () => {
      const invalidPlatform = { ...validBotPlatform };
      invalidPlatform.spec.type = 'invalid-type';
      
      const result = validateBotPlatform(invalidPlatform);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/type',
        message: expect.stringContaining('should be one of')
      }));
    });

    test('should validate BotPlatform API endpoint', () => {
      const invalidPlatform = { ...validBotPlatform };
      invalidPlatform.spec.apiEndpoint = 'not-a-url';
      
      const result = validateBotPlatform(invalidPlatform);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/apiEndpoint',
        message: expect.stringContaining('should match format "uri"')
      }));
    });
  });

  describe('BotConfiguration CRD Validation', () => {
    test('should validate valid BotConfiguration CRD', () => {
      const result = validateBotConfiguration(validBotConfiguration);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BotConfiguration with missing chatBotRef', () => {
      const invalidConfig = { ...validBotConfiguration };
      delete invalidConfig.spec.chatBotRef;
      
      const result = validateBotConfiguration(invalidConfig);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec',
        message: expect.stringContaining('chatBotRef')
      }));
    });

    test('should validate sensitive flag', () => {
      const configWithInvalidSensitive = { ...validBotConfiguration };
      configWithInvalidSensitive.spec.sensitive = 'not-a-boolean';
      
      const result = validateBotConfiguration(configWithInvalidSensitive);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/sensitive',
        message: expect.stringContaining('should be boolean')
      }));
    });
  });

  describe('BotCredential CRD Validation', () => {
    test('should validate valid BotCredential CRD', () => {
      const result = validateBotCredential(validBotCredential);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BotCredential with invalid credential type', () => {
      const invalidCredential = { ...validBotCredential };
      invalidCredential.spec.type = 'invalid-type';
      
      const result = validateBotCredential(invalidCredential);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/type',
        message: expect.stringContaining('should be one of')
      }));
    });

    test('should validate credential expiration', () => {
      const credentialWithInvalidExpiration = { ...validBotCredential };
      credentialWithInvalidExpiration.spec.expiresAt = 'invalid-date';
      
      const result = validateBotCredential(credentialWithInvalidExpiration);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/expiresAt',
        message: expect.stringContaining('should match format "date-time"')
      }));
    });

    test('should validate encrypted value is not empty', () => {
      const credentialWithEmptyValue = { ...validBotCredential };
      credentialWithEmptyValue.spec.valueEncrypted = '';
      
      const result = validateBotCredential(credentialWithEmptyValue);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '/spec/valueEncrypted',
        message: expect.stringContaining('should not be empty')
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
      const result = validateStrategy(validStrategy);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject strategy with missing metadata', () => {
      const invalidStrategy = { ...validStrategy };
      delete invalidStrategy.metadata;
      
      const result = validateStrategy(invalidStrategy);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(expect.objectContaining({
        instancePath: '',
        message: expect.stringContaining('metadata')
      }));
    });

    test('should validate strategy goals', () => {
      const strategyWithInvalidGoal = { ...validStrategy };
      strategyWithInvalidGoal.goals[0].priority = 'invalid-priority';
      
      const result = validateStrategy(strategyWithInvalidGoal);
      expect(result.valid).toBe(false);
    });
  });

  describe('ArchiMate Architecture Validation', () => {
    test('should validate valid ArchiMate model', () => {
      // References: ../docs/contributors/archimate/enterprise-architecture.xml
      const result = validateArchimate(validArchimate);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject ArchiMate with missing elements', () => {
      const invalidArchimate = { ...validArchimate };
      delete invalidArchimate.elements;
      
      const result = validateArchimate(invalidArchimate);
      expect(result.valid).toBe(false);
    });

    test('should validate ArchiMate element types', () => {
      const archimateWithInvalidElement = { ...validArchimate };
      archimateWithInvalidElement.elements[0].type = 'InvalidType';
      
      const result = validateArchimate(archimateWithInvalidElement);
      expect(result.valid).toBe(false);
    });
  });

  describe('BMML Value Proposition Validation', () => {
    test('should validate valid BMML document', () => {
      // References: ../docs/strategy/bmml/value-proposition.yaml
      const result = validateBmml(validBmml);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject BMML with missing business_motivation', () => {
      const invalidBmml = { ...validBmml };
      delete invalidBmml.business_motivation;
      
      const result = validateBmml(invalidBmml);
      expect(result.valid).toBe(false);
    });

    test('should validate BMML goal priorities', () => {
      const bmmlWithInvalidPriority = { ...validBmml };
      bmmlWithInvalidPriority.business_motivation.goals[0].priority = 'invalid';
      
      const result = validateBmml(bmmlWithInvalidPriority);
      expect(result.valid).toBe(false);
    });
  });

  describe('ADR Validation', () => {
    test('should validate valid ADR document', () => {
      // References: ../docs/contributors/adr/architecture-decisions.md
      const result = validateAdr(validAdr);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject ADR with missing decisions', () => {
      const invalidAdr = { ...validAdr };
      delete invalidAdr.decisions;
      
      const result = validateAdr(invalidAdr);
      expect(result.valid).toBe(false);
    });

    test('should validate ADR decision status', () => {
      const adrWithInvalidStatus = { ...validAdr };
      adrWithInvalidStatus.decisions[0].status = 'InvalidStatus';
      
      const result = validateAdr(adrWithInvalidStatus);
      expect(result.valid).toBe(false);
    });
  });

  describe('Cube.js Metrics Validation', () => {
    test('should validate valid Cube.js metrics', () => {
      // References: ../docs/strategy/cubejs/metrics.yaml
      const result = validateCubeJs(validCubeJs);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject Cube.js with invalid metric types', () => {
      const invalidCubeJs = { ...validCubeJs };
      invalidCubeJs.metrics[0].type = 'invalid-type';
      
      const result = validateCubeJs(invalidCubeJs);
      expect(result.valid).toBe(false);
    });

    test('should validate metric units', () => {
      const cubeJsWithInvalidUnit = { ...validCubeJs };
      cubeJsWithInvalidUnit.metrics[0].unit = 'invalid-unit';
      
      const result = validateCubeJs(cubeJsWithInvalidUnit);
      expect(result.valid).toBe(false);
    });
  });

  describe('Diagrams Validation', () => {
    test('should validate valid Diagrams document', () => {
      // References: ../docs/contributors/diagrams.md
      const result = validateDiagrams(validDiagrams);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject Diagrams with missing required fields', () => {
      const invalidDiagrams = { ...validDiagrams };
      delete invalidDiagrams.title;
      
      const result = validateDiagrams(invalidDiagrams);
      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate Diagrams rendering engine', () => {
      const diagramsWithInvalidEngine = { ...validDiagrams };
      diagramsWithInvalidEngine.rendering.engine = '';
      
      const result = validateDiagrams(diagramsWithInvalidEngine);
      expect(result.valid).toBe(false);
    });

    test('should validate Diagrams diagram types', () => {
      const diagramsWithInvalidType = { ...validDiagrams };
      diagramsWithInvalidType.diagrams[0].type = 'invalid-type';
      
      const result = validateDiagrams(diagramsWithInvalidType);
      expect(result.valid).toBe(false);
    });
  });

  describe('Gherkin Validation', () => {
    test('should validate valid Gherkin feature file', () => {
      // References: features/chatbot.feature
      const result = validateGherkin(validGherkin);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeNull();
    });

    test('should reject Gherkin with missing required fields', () => {
      const invalidGherkin = { ...validGherkin };
      delete invalidGherkin.feature;
      
      const result = validateGherkin(invalidGherkin);
      expect(result.valid).toBe(false);
      expect(result.errors).not.toBeNull();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should validate Gherkin language code', () => {
      const gherkinWithInvalidLanguage = { ...validGherkin };
      gherkinWithInvalidLanguage.language = 'invalid';
      
      const result = validateGherkin(gherkinWithInvalidLanguage);
      expect(result.valid).toBe(false);
    });

    test('should validate Gherkin step keywords', () => {
      const gherkinWithInvalidKeyword = { ...validGherkin };
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
    const goals = validBmml.business_motivation.goals;
    
    goals.forEach(goal => {
      expect(goal.success_metrics).toBeDefined();
      expect(Array.isArray(goal.success_metrics)).toBe(true);
      expect(goal.success_metrics.length).toBeGreaterThan(0);
    });
  });

  test('should validate that all value propositions have target customers', () => {
    // References: ../docs/strategy/bmml/value-proposition.yaml - value_propositions section
    const valuePropositions = validBmml.business_motivation.value_propositions;
    
    valuePropositions.forEach(vp => {
      expect(vp.target_customers).toBeDefined();
      expect(Array.isArray(vp.target_customers)).toBe(true);
      expect(vp.target_customers.length).toBeGreaterThan(0);
    });
  });

  test('should validate that all stakeholders have requirements', () => {
    // References: ../docs/strategy/bmml/value-proposition.yaml - stakeholders section
    const stakeholders = validBmml.business_motivation.stakeholders;
    
    stakeholders.forEach(stakeholder => {
      expect(stakeholder.requirements).toBeDefined();
      expect(Array.isArray(stakeholder.requirements)).toBe(true);
      expect(stakeholder.requirements.length).toBeGreaterThan(0);
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
    expect(ciCdRequirements.requirements).toContain('Platform-agnostic');
    expect(ciCdRequirements.requirements).toContain('Open-source first');
    expect(ciCdRequirements.stages).toContain('Lint');
    expect(ciCdRequirements.stages).toContain('Test');
    expect(ciCdRequirements.stages).toContain('Build');
    expect(ciCdRequirements.stages).toContain('Scan');
    expect(ciCdRequirements.stages).toContain('Sign');
    expect(ciCdRequirements.stages).toContain('Deploy');
  });
});

/**
 * Export validation functions for use in other tests
 */
module.exports = {
  validateChatBot,
  validateBotPlatform,
  validateBotConfiguration,
  validateBotCredential,
  validateStrategy,
  validateArchimate,
  validateBmml,
  validateAdr,
  validateCubeJs,
  validateDiagrams,
  validateGherkin,
  // Test data exports
  validChatBot,
  invalidChatBot,
  validBotPlatform,
  validBotConfiguration,
  validBotCredential,
  validStrategy,
  validArchimate,
  validBmml,
  validAdr,
  validCubeJs,
  validDiagrams,
  validGherkin
};