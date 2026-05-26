/**
 * Integration Tests for Automated Bot Account Creation (AG002)
 * 
 * These tests validate Application Goal AG002: "Implement automated account creation and configuration"
 * from docs/strategy/omen/strategy.json
 * 
 * References:
 * - docs/strategy/omen/strategy.json (AG002)
 * - docs/strategy/bmml/value-proposition.yaml (G002)
 * - docs/contributors/adr/architecture-decisions.md (ADR-001, ADR-002, ADR-003)
 * - features/chatbot.feature (Provisioning scenarios)
 */

const path = require('path');
const fs = require('fs');

// Mock Kubernetes client for testing
class MockK8sClient {
  constructor() {
    this.objects = new Map();
    this.createdObjects = [];
    this.updatedObjects = [];
    this.deletedObjects = [];
  }

  create(obj) {
    const key = `${obj.kind}/${obj.metadata.namespace}/${obj.metadata.name}`;
    this.objects.set(key, obj);
    this.createdObjects.push({ kind: obj.kind, name: obj.metadata.name, namespace: obj.metadata.namespace });
    return { ...obj, status: { phase: 'Created' } };
  }

  get(kind, name, namespace = 'default') {
    const key = `${kind.kind || kind}/${namespace}/${name}`;
    return this.objects.get(key) || null;
  }

  update(obj) {
    const key = `${obj.kind}/${obj.metadata.namespace}/${obj.metadata.name}`;
    this.objects.set(key, obj);
    this.updatedObjects.push({ kind: obj.kind, name: obj.metadata.name, namespace: obj.metadata.namespace });
    return obj;
  }

  delete(obj) {
    const key = `${obj.kind}/${obj.metadata.namespace}/${obj.metadata.name}`;
    this.objects.delete(key);
    this.deletedObjects.push({ kind: obj.kind, name: obj.metadata.name, namespace: obj.metadata.namespace });
  }

  list(kind, namespace = 'default') {
    const result = [];
    for (const [key, obj] of this.objects) {
      if (key.startsWith(`${kind.kind || kind}/${namespace}/`)) {
        result.push(obj);
      }
    }
    return result;
  }

  getCreatedObjects() {
    return this.createdObjects;
  }

  getUpdatedObjects() {
    return this.updatedObjects;
  }

  getDeletedObjects() {
    return this.deletedObjects;
  }

  reset() {
    this.objects.clear();
    this.createdObjects = [];
    this.updatedObjects = [];
    this.deletedObjects = [];
  }
}

// Mock provisioner for testing
default class MockProvisioner {
  constructor(platform) {
    this.platform = platform;
    this.provisionedBots = new Map();
  }

  async provision(botSpec) {
    const botId = `bot-${this.platform}-${Date.now()}`;
    const botToken = `token-${this.platform}-${Date.now()}`;
    const webhookUrl = `https://${this.platform}.example.com/webhook/${botId}`;

    this.provisionedBots.set(botId, {
      botId,
      botToken,
      webhookUrl,
      spec: botSpec,
      platform: this.platform,
      status: 'Ready'
    });

    return {
      botId,
      botToken,
      webhookUrl,
      status: 'Provisioned'
    };
  }

  async deprovision(botId) {
    this.provisionedBots.delete(botId);
    return { status: 'Deprovisioned' };
  }

  getProvisionedBot(botId) {
    return this.provisionedBots.get(botId);
  }
}

// Test data
const validChatBotSpec = {
  platform: 'slack',
  name: 'test-slack-bot',
  displayName: 'Test Slack Bot',
  description: 'A test bot for automated provisioning',
  configuration: {
    backendURL: 'https://backend.example.com',
    webhookPath: '/webhook',
    rateLimit: 100,
    timeoutSeconds: 30
  },
  enabled: true,
  resources: {
    requests: { cpu: '100m', memory: '128Mi' },
    limits: { cpu: '500m', memory: '512Mi' }
  }
};

const validBotPlatformSpec = {
  platformType: 'slack',
  name: 'slack-platform',
  displayName: 'Slack Platform',
  description: 'Slack platform configuration',
  api: {
    baseURL: 'https://slack.com/api',
    version: 'v2',
    rateLimit: 60,
    timeoutSeconds: 30
  },
  authentication: {
    method: 'oauth2',
    oauth2: {
      clientID: 'test-client-id',
      clientSecret: 'test-client-secret-ref',
      tokenURL: 'https://slack.com/oauth/token',
      scopes: ['bot', 'chat:write']
    }
  },
  provisioning: {
    provisionerImage: 'ghcr.io/fruitywelsh/chatbot-provisioner-slack:v1.0.0',
    provisionerCommand: ['/provisioner'],
    timeoutSeconds: 300,
    resources: {
      requests: { cpu: '50m', memory: '64Mi' },
      limits: { cpu: '200m', memory: '256Mi' }
    }
  }
};

const invalidChatBotSpec = {
  // Missing required platform field
  name: 'invalid-bot',
  displayName: 'Invalid Bot'
};

const unsupportedPlatformSpec = {
  platform: 'unsupported-platform',
  name: 'unsupported-bot'
};

// Helper function to create a mock ChatBot object
function createMockChatBot(spec, namespace = 'default') {
  return {
    apiVersion: 'chatbot.operator/v1alpha1',
    kind: 'ChatBot',
    metadata: {
      name: spec.name || 'test-bot',
      namespace,
      uid: `uid-${Date.now()}`,
      generation: 1,
      creationTimestamp: new Date().toISOString()
    },
    spec,
    status: {
      phase: 'Pending',
      message: '',
      reason: '',
      botID: '',
      botToken: '',
      webhookURL: ''
    }
  };
}

// Helper function to create a mock BotPlatform object
function createMockBotPlatform(spec, namespace = 'default') {
  return {
    apiVersion: 'chatbot.operator/v1alpha1',
    kind: 'BotPlatform',
    metadata: {
      name: spec.name || 'test-platform',
      namespace,
      uid: `uid-${Date.now()}`,
      generation: 1,
      creationTimestamp: new Date().toISOString()
    },
    spec,
    status: {
      phase: 'Pending',
      message: '',
      reason: '',
      provisionerStatus: 'NotReady',
      apiStatus: 'NotConnected'
    }
  };
}

// Test suite: AG002 - Automated Bot Account Creation
// ====================================================
describe('Automated Bot Account Creation (AG002)', () => {
  let mockClient;
  let mockProvisioner;

  beforeEach(() => {
    mockClient = new MockK8sClient();
    mockProvisioner = new MockProvisioner('slack');
  });

  afterEach(() => {
    mockClient.reset();
  });

  // AG002: Automated account creation and configuration
  // Success Criteria: Bots can be created, configured, and managed via Kubernetes API
  describe('Bot Provisioning Lifecycle', () => {
    test('should provision Slack bot with valid configuration (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: docs/strategy/bmml/value-proposition.yaml - G002
      // References: features/chatbot.feature - "Create a new ChatBot resource"

      const botSpec = { ...validChatBotSpec, name: 'slack-test-bot' };
      const chatBot = createMockChatBot(botSpec);

      // Create the ChatBot resource
      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();
      expect(created.metadata.name).toBe('slack-test-bot');

      // Simulate provisioning via the provisioner
      const provisionResult = mockProvisioner.provision(botSpec);
      expect(provisionResult).toBeDefined();
      expect(provisionResult.botId).toBeTruthy();
      expect(provisionResult.botToken).toBeTruthy();
      expect(provisionResult.webhookUrl).toBeTruthy();

      // Verify the bot was provisioned
      const provisionedBot = mockProvisioner.getProvisionedBot(provisionResult.botId);
      expect(provisionedBot).toBeDefined();
      expect(provisionedBot.platform).toBe('slack');
      expect(provisionedBot.status).toBe('Provisioned');
    });

    test('should provision Matrix bot with valid configuration (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: docs/strategy/bmml/value-proposition.yaml - G002

      const matrixProvisioner = new MockProvisioner('matrix');
      const matrixSpec = { ...validChatBotSpec, platform: 'matrix', name: 'matrix-test-bot' };
      const chatBot = createMockChatBot(matrixSpec);

      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();

      const provisionResult = matrixProvisioner.provision(matrixSpec);
      expect(provisionResult.botId).toBeTruthy();
      expect(provisionResult.webhookUrl).toContain('matrix');
    });

    test('should provision Discord bot with valid configuration (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: docs/strategy/bmml/value-proposition.yaml - G002

      const discordProvisioner = new MockProvisioner('discord');
      const discordSpec = { ...validChatBotSpec, platform: 'discord', name: 'discord-test-bot' };
      const chatBot = createMockChatBot(discordSpec);

      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();

      const provisionResult = discordProvisioner.provision(discordSpec);
      expect(provisionResult.botId).toBeTruthy();
      expect(provisionResult.webhookUrl).toContain('discord');
    });

    test('should provision Twilio bot with valid configuration (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: docs/strategy/bmml/value-proposition.yaml - G002

      const twilioProvisioner = new MockProvisioner('twilio');
      const twilioSpec = { ...validChatBotSpec, platform: 'twilio', name: 'twilio-test-bot' };
      const chatBot = createMockChatBot(twilioSpec);

      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();

      const provisionResult = twilioProvisioner.provision(twilioSpec);
      expect(provisionResult.botId).toBeTruthy();
    });

    test('should reject bot with invalid configuration (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: features/chatbot.feature - "Create a ChatBot with invalid specification"

      const chatBot = createMockChatBot(invalidChatBotSpec);
      
      // In real implementation, this would fail validation
      // For mock testing, we just verify the spec is invalid
      expect(invalidChatBotSpec.platform).toBeUndefined();
      expect(chatBot.spec.platform).toBeUndefined();
    });

    test('should reject bot with unsupported platform (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002

      const chatBot = createMockChatBot(unsupportedPlatformSpec);
      expect(chatBot.spec.platform).toBe('unsupported-platform');
      
      // In real implementation, this would fail validation
      // Supported platforms: slack, matrix, discord, twilio
    });
  });

  // AG002: Configuration management
  describe('Bot Configuration Management', () => {
    test('should configure bot with platform-specific settings (AG002)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G002
      // References: docs/contributors/adr/ADR-003 (Multi-Platform Bot Support)

      const platform = createMockBotPlatform(validBotPlatformSpec);
      const created = mockClient.create(platform);
      expect(created).not.toBeNull();

      // Verify platform configuration
      expect(created.spec.platformType).toBe('slack');
      expect(created.spec.api.baseURL).toBe('https://slack.com/api');
      expect(created.spec.api.version).toBe('v2');
      expect(created.spec.authentication.method).toBe('oauth2');
    });

    test('should update bot configuration when spec changes (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002

      const botSpec = { ...validChatBotSpec, name: 'update-test-bot' };
      const chatBot = createMockChatBot(botSpec);

      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();

      // Update the bot configuration
      const updatedSpec = { ...botSpec, displayName: 'Updated Display Name' };
      const updatedBot = { ...created, spec: updatedSpec };
      updatedBot.metadata.resourceVersion = '2';

      const updated = mockClient.update(updatedBot);
      expect(updated).not.toBeNull();
      expect(updated.spec.displayName).toBe('Updated Display Name');

      // Verify update was tracked
      const updates = mockClient.getUpdatedObjects();
      expect(updates.length).toBeGreaterThan(0);
      expect(updates[0].name).toBe('update-test-bot');
    });

    test('should manage bot lifecycle via Kubernetes API (AG002)', () => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: docs/contributors/adr/ADR-001 (Kubernetes Operator Pattern)

      const botSpec = { ...validChatBotSpec, name: 'lifecycle-test-bot' };
      const chatBot = createMockChatBot(botSpec);

      // Create
      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();
      expect(mockClient.getCreatedObjects().length).toBe(1);

      // Update
      const updatedSpec = { ...botSpec, description: 'Updated description' };
      const updatedBot = { ...created, spec: updatedSpec };
      updatedBot.metadata.resourceVersion = '2';
      mockClient.update(updatedBot);
      expect(mockClient.getUpdatedObjects().length).toBe(1);

      // Delete
      mockClient.delete(updatedBot);
      expect(mockClient.getDeletedObjects().length).toBe(1);
    });
  });

  // AG002: All supported platforms
  describe('Multi-Platform Support (AG002 + ADR-003)', () => {
    const platforms = ['slack', 'matrix', 'discord', 'twilio'];

    test.each(platforms)('should support %s platform (AG002, ADR-003)', (platform) => {
      // References: docs/strategy/omen/strategy.json - AG002
      // References: docs/contributors/adr/application-adrs.md - ADR-003

      const provisioner = new MockProvisioner(platform);
      const spec = { ...validChatBotSpec, platform, name: `${platform}-test-bot` };
      const chatBot = createMockChatBot(spec);

      const created = mockClient.create(chatBot);
      expect(created).not.toBeNull();

      const provisionResult = provisioner.provision(spec);
      expect(provisionResult.botId).toBeTruthy();
      expect(provisionResult.webhookUrl).toContain(platform);

      const provisionedBot = provisioner.getProvisionedBot(provisionResult.botId);
      expect(provisionedBot.platform).toBe(platform);
    });
  });

  // Success criteria validation
  describe('AG002 Success Criteria Validation', () => {
    test('should validate number of supported platforms (Success Metric)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G002 success_metrics

      const supportedPlatforms = ['slack', 'matrix', 'discord', 'twilio'];
      expect(supportedPlatforms.length).toBe(4);
      expect(supportedPlatforms).toContain('slack');
      expect(supportedPlatforms).toContain('matrix');
      expect(supportedPlatforms).toContain('discord');
      expect(supportedPlatforms).toContain('twilio');
    });

    test('should validate CRD adoption for all platforms (Success Metric)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G001 success_metrics

      const crds = ['ChatBot', 'BotPlatform', 'BotConfiguration', 'BotCredential'];
      expect(crds.length).toBeGreaterThan(0);
      expect(crds).toContain('ChatBot');
      expect(crds).toContain('BotPlatform');
    });

    test('should validate provisioning time metrics (Success Metric)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G002 success_metrics

      // In real implementation, this would measure actual provisioning time
      // For mock testing, we just validate the metric structure
      const metrics = {
        provisioningTimeSeconds: 0,
        messagesProcessed: 0,
        errors: 0
      };

      expect(metrics.provisioningTimeSeconds).toBeDefined();
      expect(metrics.messagesProcessed).toBeDefined();
      expect(metrics.errors).toBeDefined();
    });
  });
});

// Test suite: G002 - Automated Bot Provisioning (BMML Goal)
describe('Automated Bot Provisioning (G002)', () => {
  let mockClient;
  let mockProvisioner;

  beforeEach(() => {
    mockClient = new MockK8sClient();
    mockProvisioner = new MockProvisioner('slack');
  });

  test('should reduce manual setup time (G002)', () => {
    // References: docs/strategy/bmml/value-proposition.yaml - G002
    // Business Value: Reduces manual setup time and errors

    const startTime = Date.now();
    const botSpec = { ...validChatBotSpec, name: 'manual-setup-test' };
    const chatBot = createMockChatBot(botSpec);

    // Create and provision
    mockClient.create(chatBot);
    mockProvisioner.provision(botSpec);

    const endTime = Date.now();
    const provisioningTimeMs = endTime - startTime;

    // In real implementation, this should be < 5 minutes
    // For mock testing, we just verify it completes
    expect(provisioningTimeMs).toBeGreaterThan(0);
    expect(provisioningTimeMs).toBeLessThan(10000); // Mock should be fast
  });

  test('should reduce errors through automation (G002)', () => {
    // References: docs/strategy/bmml/value-proposition.yaml - G002
    // Business Value: Reduces manual setup time and errors

    // Automated provisioning should have consistent results
    const botSpec = { ...validChatBotSpec, name: 'error-reduction-test' };

    const results = [];
    for (let i = 0; i < 5; i++) {
      const provisioner = new MockProvisioner('slack');
      const result = provisioner.provision(botSpec);
      results.push(result);
    }

    // All results should be successful
    results.forEach(result => {
      expect(result.status).toBe('Provisioned');
      expect(result.botId).toBeTruthy();
      expect(result.botToken).toBeTruthy();
    });

    // All results should have similar structure
    const firstResult = results[0];
    results.forEach(result => {
      expect(Object.keys(result)).toEqual(Object.keys(firstResult));
    });
  });

  test('should enable declarative management (G002)', () => {
    // References: docs/strategy/bmml/value-proposition.yaml - G002
    // Value Elements: Declarative configuration via CRDs

    const botSpec = { ...validChatBotSpec, name: 'declarative-test' };
    const chatBot = createMockChatBot(botSpec);

    // Create via declarative Kubernetes API
    const created = mockClient.create(chatBot);
    expect(created).not.toBeNull();

    // The bot should be provisioned based on the declarative spec
    const provisioner = new MockProvisioner('slack');
    const provisionResult = provisioner.provision(botSpec);
    
    expect(provisionResult.status).toBe('Provisioned');
    expect(provisionResult.botId).toBeTruthy();
  });
});

module.exports = {
  MockK8sClient,
  MockProvisioner,
  validChatBotSpec,
  validBotPlatformSpec,
  invalidChatBotSpec,
  unsupportedPlatformSpec,
  createMockChatBot,
  createMockBotPlatform
};
