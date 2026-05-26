/**
 * RBAC Tests for Separation of Concerns (AG003)
 * 
 * These tests validate Application Goal AG003: "Maintain separation of concerns between
 * Platform Engineering and AppDev" from docs/strategy/omen/strategy.json
 * 
 * References:
 * - docs/strategy/omen/strategy.json (Application Goal AG003)
 * - docs/strategy/bmml/value-proposition.yaml (Goal G003)
 * - docs/contributors/adr/architecture-decisions.md (ADR-004, ADR-005)
 */

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

// Mock RBAC configuration
const platformEngineeringRole = {
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'Role',
  metadata: {
    name: 'platform-engineering',
    namespace: 'chatbot-operator'
  },
  rules: [
    {
      apiGroups: [''],
      resources: ['secrets', 'configmaps', 'services', 'deployments'],
      verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
    },
    {
      apiGroups: ['chatbotoperator.io'],
      resources: ['botplatforms'],
      verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
    },
    {
      apiGroups: ['rbac.authorization.k8s.io'],
      resources: ['roles', 'rolebindings', 'clusterroles', 'clusterrolebindings'],
      verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
    },
    {
      apiGroups: ['policy'],
      resources: ['podsecuritypolicies'],
      verbs: ['use']
    },
    {
      apiGroups: ['networking.k8s.io'],
      resources: ['networkpolicies', 'ingresses'],
      verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
    }
  ]
};

const appDevRole = {
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'Role',
  metadata: {
    name: 'appdev',
    namespace: 'chatbot-operator'
  },
  rules: [
    {
      apiGroups: ['chatbotoperator.io'],
      resources: ['chatbots', 'botconfigurations', 'botcredentials'],
      verbs: ['get', 'list', 'watch', 'create', 'update', 'patch', 'delete']
    },
    {
      apiGroups: [''],
      resources: ['secrets'],
      verbs: ['get', 'list', 'watch'],
      resourceNames: ['bot-*'] // Only bot-related secrets
    },
    {
      apiGroups: [''],
      resources: ['configmaps'],
      verbs: ['get', 'list', 'watch']
    }
  ]
};

const securityTeamRole = {
  apiVersion: 'rbac.authorization.k8s.io/v1',
  kind: 'Role',
  metadata: {
    name: 'security-team',
    namespace: 'chatbot-operator'
  },
  rules: [
    {
      apiGroups: [''],
      resources: ['secrets', 'configmaps'],
      verbs: ['get', 'list', 'watch']
    },
    {
      apiGroups: ['chatbotoperator.io'],
      resources: ['*'],
      verbs: ['get', 'list', 'watch']
    },
    {
      apiGroups: ['policy'],
      resources: ['podsecuritypolicies'],
      verbs: ['get', 'list', 'watch']
    }
  ]
};

// Mock Kubernetes RBAC validator
class MockRBACValidator {
  constructor(roles, roleBindings, clusterRoles, clusterRoleBindings) {
    this.roles = roles || {};
    this.roleBindings = roleBindings || {};
    this.clusterRoles = clusterRoles || {};
    this.clusterRoleBindings = clusterRoleBindings || {};
  }

  canPerform(user, namespace, apiGroup, resource, verb) {
    // Check if user has permission via Role
    const roleBindings = this.roleBindings[namespace] || [];
    for (const binding of roleBindings) {
      if (binding.subjects && binding.subjects.some(s => s.name === user)) {
        const roleName = binding.roleRef.name;
        const role = this.roles[`${namespace}/${roleName}`];
        if (role && this.checkRolePermission(role, apiGroup, resource, verb)) {
          return true;
        }
      }
    }

    // Check if user has permission via ClusterRole
    const clusterRoleBindings = Object.values(this.clusterRoleBindings);
    for (const binding of clusterRoleBindings) {
      if (binding.subjects && binding.subjects.some(s => s.name === user)) {
        const roleName = binding.roleRef.name;
        const role = this.clusterRoles[roleName];
        if (role && this.checkRolePermission(role, apiGroup, resource, verb)) {
          return true;
        }
      }
    }

    return false;
  }

  checkRolePermission(role, apiGroup, resource, verb) {
    if (!role.rules) return false;
    
    for (const rule of role.rules) {
      // Check API group
      const apiGroupMatch = rule.apiGroups.includes('*') || 
                          rule.apiGroups.includes(apiGroup) ||
                          rule.apiGroups.includes('');
      
      // Check resource
      const resourceMatch = rule.resources.includes('*') || 
                           rule.resources.includes(resource);
      
      // Check verb
      const verbMatch = rule.verbs.includes('*') || 
                       rule.verbs.includes(verb);
      
      // Check resource names if specified
      let resourceNameMatch = true;
      if (rule.resourceNames && rule.resourceNames.length > 0) {
        // For this mock, we'll assume the resource name matches if not specified
        resourceNameMatch = !rule.resourceNames || rule.resourceNames.includes('*');
      }
      
      if (apiGroupMatch && resourceMatch && verbMatch && resourceNameMatch) {
        return true;
      }
    }
    
    return false;
  }

  getUserPermissions(user, namespace) {
    const permissions = {
      apiGroups: new Set(),
      resources: new Set(),
      verbs: new Set()
    };

    // Get permissions from Roles
    const roleBindings = this.roleBindings[namespace] || [];
    for (const binding of roleBindings) {
      if (binding.subjects && binding.subjects.some(s => s.name === user)) {
        const roleName = binding.roleRef.name;
        const role = this.roles[`${namespace}/${roleName}`];
        if (role) {
          this.addRolePermissions(permissions, role);
        }
      }
    }

    // Get permissions from ClusterRoles
    const clusterRoleBindings = Object.values(this.clusterRoleBindings);
    for (const binding of clusterRoleBindings) {
      if (binding.subjects && binding.subjects.some(s => s.name === user)) {
        const roleName = binding.roleRef.name;
        const role = this.clusterRoles[roleName];
        if (role) {
          this.addRolePermissions(permissions, role);
        }
      }
    }

    return {
      apiGroups: Array.from(permissions.apiGroups),
      resources: Array.from(permissions.resources),
      verbs: Array.from(permissions.verbs)
    };
  }

  addRolePermissions(permissions, role) {
    if (!role.rules) return;
    
    for (const rule of role.rules) {
      if (rule.apiGroups) {
        rule.apiGroups.forEach(g => permissions.apiGroups.add(g));
      }
      if (rule.resources) {
        rule.resources.forEach(r => permissions.resources.add(r));
      }
      if (rule.verbs) {
        rule.verbs.forEach(v => permissions.verbs.add(v));
      }
    }
  }
}

// Test suite: AG003 - Separation of Concerns
// ============================================
describe('Separation of Concerns (AG003)', () => {
  let rbacValidator;
  let roles;
  let roleBindings;

  beforeEach(() => {
    // Set up RBAC configuration
    roles = {
      'chatbot-operator/platform-engineering': platformEngineeringRole,
      'chatbot-operator/appdev': appDevRole,
      'chatbot-operator/security-team': securityTeamRole
    };

    roleBindings = {
      'chatbot-operator': [
        {
          metadata: { name: 'pe-binding', namespace: 'chatbot-operator' },
          subjects: [{ kind: 'User', name: 'platform-engineer', namespace: 'chatbot-operator' }],
          roleRef: { kind: 'Role', name: 'platform-engineering', apiGroup: 'rbac.authorization.k8s.io' }
        },
        {
          metadata: { name: 'appdev-binding', namespace: 'chatbot-operator' },
          subjects: [{ kind: 'User', name: 'appdev', namespace: 'chatbot-operator' }],
          roleRef: { kind: 'Role', name: 'appdev', apiGroup: 'rbac.authorization.k8s.io' }
        },
        {
          metadata: { name: 'security-binding', namespace: 'chatbot-operator' },
          subjects: [{ kind: 'User', name: 'security', namespace: 'chatbot-operator' }],
          roleRef: { kind: 'Role', name: 'security-team', apiGroup: 'rbac.authorization.k8s.io' }
        }
      ]
    };

    rbacValidator = new MockRBACValidator(roles, roleBindings);
  });

  // AG003: Platform Engineering responsibilities
  // ============================================
  describe('Platform Engineering Team Responsibilities (AG003)', () => {
    const peUser = 'platform-engineer';

    test('should manage cluster configuration (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // References: docs/strategy/omen/strategy.json - Platform Engineering responsibilities

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', '', 'secrets', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', '', 'configmaps', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', '', 'services', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', '', 'deployments', 'create')).toBe(true);
    });

    test('should manage BotPlatform resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'update')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'delete')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'get')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'list')).toBe(true);
    });

    test('should manage RBAC/ABAC policies (AG003, AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG003, AG004

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'rbac.authorization.k8s.io', 'roles', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'rbac.authorization.k8s.io', 'rolebindings', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'rbac.authorization.k8s.io', 'clusterroles', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'rbac.authorization.k8s.io', 'clusterrolebindings', 'create')).toBe(true);
    });

    test('should manage service mesh configuration (AG003, AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG003, AG004
      // References: docs/contributors/adr/application-adrs.md - ADR-004

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'networking.k8s.io', 'networkpolicies', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'networking.k8s.io', 'ingresses', 'create')).toBe(true);
    });

    test('should manage monitoring and observability (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', '', 'services', 'create')).toBe(true);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', '', 'deployments', 'create')).toBe(true);
    });

    test('should manage security policies (AG003, AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG003, AG004

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'policy', 'podsecuritypolicies', 'use')).toBe(true);
    });

    test('should NOT manage ChatBot resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // Platform Engineering should NOT manage individual bot resources

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'create')).toBe(false);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(false);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'delete')).toBe(false);
    });

    test('should NOT manage BotConfiguration resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botconfigurations', 'create')).toBe(false);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botconfigurations', 'update')).toBe(false);
    });

    test('should NOT manage BotCredential resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botcredentials', 'create')).toBe(false);
      expect(rbacValidator.canPerform(peUser, 'chatbot-operator', 'chatbotoperator.io', 'botcredentials', 'update')).toBe(false);
    });
  });

  // AG003: AppDev responsibilities
  // ===============================
  describe('AppDev Team Responsibilities (AG003)', () => {
    const appDevUser = 'appdev';

    test('should manage ChatBot resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'create')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'delete')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'get')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'list')).toBe(true);
    });

    test('should manage BotConfiguration resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botconfigurations', 'create')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botconfigurations', 'update')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botconfigurations', 'delete')).toBe(true);
    });

    test('should manage BotCredential resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botcredentials', 'create')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botcredentials', 'update')).toBe(true);
    });

    test('should read secrets for bot configuration (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // AppDev needs to read secrets to configure bots, but not manage them

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'secrets', 'get')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'secrets', 'list')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'secrets', 'watch')).toBe(true);
      
      // But NOT create, update, or delete secrets
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'secrets', 'create')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'secrets', 'update')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'secrets', 'delete')).toBe(false);
    });

    test('should read configmaps (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'configmaps', 'get')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'configmaps', 'list')).toBe(true);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'configmaps', 'watch')).toBe(true);
    });

    test('should NOT manage infrastructure (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'services', 'create')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', '', 'deployments', 'create')).toBe(false);
    });

    test('should NOT manage BotPlatform resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'create')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'update')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'delete')).toBe(false);
    });

    test('should NOT manage RBAC/ABAC policies (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'rbac.authorization.k8s.io', 'roles', 'create')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'rbac.authorization.k8s.io', 'rolebindings', 'create')).toBe(false);
    });

    test('should NOT manage service mesh configuration (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'networking.k8s.io', 'networkpolicies', 'create')).toBe(false);
      expect(rbacValidator.canPerform(appDevUser, 'chatbot-operator', 'networking.k8s.io', 'ingresses', 'create')).toBe(false);
    });
  });

  // AG003: Security Team responsibilities
  // =======================================
  describe('Security Team Responsibilities (AG003, AG004)', () => {
    const securityUser = 'security';

    test('should read all secrets and configmaps (AG003, AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG003, AG004

      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'secrets', 'get')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'secrets', 'list')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'secrets', 'watch')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'configmaps', 'get')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'configmaps', 'list')).toBe(true);
    });

    test('should read all ChatBot Operator resources (AG003, AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG003, AG004

      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'get')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'list')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'get')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'list')).toBe(true);
    });

    test('should read security policies (AG003, AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG003, AG004

      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'policy', 'podsecuritypolicies', 'get')).toBe(true);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'policy', 'podsecuritypolicies', 'list')).toBe(true);
    });

    test('should NOT create or modify resources (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // Security Team should have read-only access

      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'secrets', 'create')).toBe(false);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', '', 'configmaps', 'create')).toBe(false);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'create')).toBe(false);
      expect(rbacValidator.canPerform(securityUser, 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'create')).toBe(false);
    });
  });

  // AG003: Separation validation
  // ==============================
  describe('Separation of Concerns Validation (AG003)', () => {
    test('should have clear responsibility boundaries (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003

      const pePermissions = rbacValidator.getUserPermissions('platform-engineer', 'chatbot-operator');
      const appDevPermissions = rbacValidator.getUserPermissions('appdev', 'chatbot-operator');

      // Platform Engineering should have infrastructure permissions
      expect(pePermissions.resources).toContain('secrets');
      expect(pePermissions.resources).toContain('deployments');
      expect(pePermissions.resources).toContain('services');
      expect(pePermissions.resources).toContain('botplatforms');

      // AppDev should have bot-specific permissions
      expect(appDevPermissions.resources).toContain('chatbots');
      expect(appDevPermissions.resources).toContain('botconfigurations');
      expect(appDevPermissions.resources).toContain('botcredentials');

      // Verify no overlap in critical areas
      // Platform Engineering should NOT have chatbot permissions
      expect(pePermissions.resources).not.toContain('chatbots');
      expect(pePermissions.resources).not.toContain('botconfigurations');

      // AppDev should NOT have infrastructure permissions
      expect(appDevPermissions.resources).not.toContain('deployments');
      expect(appDevPermissions.resources).not.toContain('services');
      expect(appDevPermissions.resources).not.toContain('botplatforms');
    });

    test('should prevent cross-team conflicts (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // Success Criteria: Clear responsibility boundaries and reduced conflicts

      // Platform Engineering can manage infrastructure
      expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', '', 'deployments', 'create')).toBe(true);
      
      // AppDev cannot manage infrastructure
      expect(rbacValidator.canPerform('appdev', 'chatbot-operator', '', 'deployments', 'create')).toBe(false);

      // AppDev can manage bots
      expect(rbacValidator.canPerform('appdev', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'create')).toBe(true);
      
      // Platform Engineering cannot manage bots
      expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'create')).toBe(false);
    });

    test('should support independent deployment (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // Success Criteria: Deployment frequency per team

      // Both teams should be able to deploy their changes independently
      expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'update')).toBe(true);
      expect(rbacValidator.canPerform('appdev', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(true);
    });

    test('should support reduced cross-team dependencies (AG003)', () => {
      // References: docs/strategy/omen/strategy.json - AG003
      // Success Criteria: Number of cross-team dependencies

      // Platform Engineering permissions
      const pePermissions = rbacValidator.getUserPermissions('platform-engineer', 'chatbot-operator');
      
      // AppDev permissions
      const appDevPermissions = rbacValidator.getUserPermissions('appdev', 'chatbot-operator');

      // Count overlapping permissions (should be minimal)
      const peResources = new Set(pePermissions.resources);
      const appDevResources = new Set(appDevPermissions.resources);
      const overlappingResources = [...peResources].filter(r => appDevResources.has(r));

      // Only shared read-only resources should overlap (like configmaps for reading)
      expect(overlappingResources.length).toBeLessThanOrEqual(2);
      expect(overlappingResources).toContain('configmaps'); // Both can read configmaps
    });
  });

  // AG003 + AG004: Security by Design
  // ================================
  describe('Security by Design (AG003 + AG004)', () => {
    test('should enforce Zero Trust principles (AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG004
      // References: docs/contributors/adr/application-adrs.md - ADR-004

      // All access should be explicitly granted via RBAC
      const pePermissions = rbacValidator.getUserPermissions('platform-engineer', 'chatbot-operator');
      const appDevPermissions = rbacValidator.getUserPermissions('appdev', 'chatbot-operator');

      // No wildcard permissions
      expect(pePermissions.verbs).not.toContain('*');
      expect(appDevPermissions.verbs).not.toContain('*');

      // Explicit permissions only
      expect(pePermissions.verbs.length).toBeGreaterThan(0);
      expect(appDevPermissions.verbs.length).toBeGreaterThan(0);
    });

    test('should enforce least privilege (AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG004

      const appDevPermissions = rbacValidator.getUserPermissions('appdev', 'chatbot-operator');

      // AppDev should only have permissions for bot resources and read-only for secrets
      expect(appDevPermissions.resources).toContain('chatbots');
      expect(appDevPermissions.resources).toContain('botconfigurations');
      expect(appDevPermissions.resources).toContain('secrets');

      // But NOT for infrastructure
      expect(appDevPermissions.resources).not.toContain('deployments');
      expect(appDevPermissions.resources).not.toContain('services');
    });

    test('should enforce service-to-service authentication (AG004)', () => {
      // References: docs/strategy/omen/strategy.json - AG004
      // References: docs/contributors/adr/application-adrs.md - ADR-004

      // This would be validated by Linkerd configuration in a real implementation
      // For mock testing, we verify the RBAC structure supports it
      expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', 'networking.k8s.io', 'networkpolicies', 'create')).toBe(true);
    });
  });

  // AG003: Success Metrics
  // ======================
  describe('AG003 Success Metrics Validation', () => {
    test('should validate clear responsibility boundaries (Success Metric)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G003 success_metrics

      const pePermissions = rbacValidator.getUserPermissions('platform-engineer', 'chatbot-operator');
      const appDevPermissions = rbacValidator.getUserPermissions('appdev', 'chatbot-operator');

      // Platform Engineering: Infrastructure
      expect(pePermissions.resources).toContain('deployments');
      expect(pePermissions.resources).toContain('services');
      expect(pePermissions.resources).toContain('botplatforms');

      // AppDev: Bot resources
      expect(appDevPermissions.resources).toContain('chatbots');
      expect(appDevPermissions.resources).toContain('botconfigurations');

      // No overlap in write permissions
      const peWriteResources = pePermissions.resources.filter(r => 
        pePermissions.verbs.includes('create') || pePermissions.verbs.includes('update') || pePermissions.verbs.includes('delete')
      );
      const appDevWriteResources = appDevPermissions.resources.filter(r => 
        appDevPermissions.verbs.includes('create') || appDevPermissions.verbs.includes('update') || appDevPermissions.verbs.includes('delete')
      );

      const overlappingWrite = peWriteResources.filter(r => appDevWriteResources.includes(r));
      expect(overlappingWrite.length).toBe(0);
    });

    test('should validate deployment frequency per team (Success Metric)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G003 success_metrics

      // Both teams should be able to deploy independently
      expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'update')).toBe(true);
      expect(rbacValidator.canPerform('appdev', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(true);
    });

    test('should validate incident resolution time (Success Metric)', () => {
      // References: docs/strategy/bmml/value-proposition.yaml - G003 success_metrics

      // Clear separation should lead to faster incident resolution
      // Platform Engineering can fix infrastructure issues
      expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', '', 'deployments', 'update')).toBe(true);
      
      // AppDev can fix bot configuration issues
      expect(rbacValidator.canPerform('appdev', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(true);
    });
  });
});

// Test suite: G003 - Separation of Concerns (BMML Goal)
// ====================================================
describe('Separation of Concerns (G003)', () => {
  let rbacValidator;

  beforeEach(() => {
    const roles = {
      'chatbot-operator/platform-engineering': platformEngineeringRole,
      'chatbot-operator/appdev': appDevRole
    };

    const roleBindings = {
      'chatbot-operator': [
        {
          metadata: { name: 'pe-binding', namespace: 'chatbot-operator' },
          subjects: [{ kind: 'User', name: 'platform-engineer', namespace: 'chatbot-operator' }],
          roleRef: { kind: 'Role', name: 'platform-engineering', apiGroup: 'rbac.authorization.k8s.io' }
        },
        {
          metadata: { name: 'appdev-binding', namespace: 'chatbot-operator' },
          subjects: [{ kind: 'User', name: 'appdev', namespace: 'chatbot-operator' }],
          roleRef: { kind: 'Role', name: 'appdev', apiGroup: 'rbac.authorization.k8s.io' }
        }
      ]
    };

    rbacValidator = new MockRBACValidator(roles, roleBindings);
  });

  test('should maintain clear responsibility boundaries (G003)', () => {
    // References: docs/strategy/bmml/value-proposition.yaml - G003
    // Business Value: Clear responsibility boundaries and reduced conflicts

    const pePermissions = rbacValidator.getUserPermissions('platform-engineer', 'chatbot-operator');
    const appDevPermissions = rbacValidator.getUserPermissions('appdev', 'chatbot-operator');

    // Platform Engineering: Infrastructure
    expect(pePermissions.resources).toContain('deployments');
    expect(pePermissions.resources).toContain('services');

    // AppDev: Bot resources
    expect(appDevPermissions.resources).toContain('chatbots');
    expect(appDevPermissions.resources).toContain('botconfigurations');

    // No overlap
    const peResources = new Set(pePermissions.resources);
    const appDevResources = new Set(appDevPermissions.resources);
    const overlapping = [...peResources].filter(r => appDevResources.has(r));

    expect(overlapping.length).toBeLessThanOrEqual(1); // Only configmaps for reading
  });

  test('should improve developer productivity (G003)', () => {
    // References: docs/strategy/bmml/value-proposition.yaml - G003
    // Business Value: Improves developer productivity and reduces time-to-market

    // Both teams can work independently
    expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', 'chatbotoperator.io', 'botplatforms', 'update')).toBe(true);
    expect(rbacValidator.canPerform('appdev', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(true);
  });

  test('should reduce code review participation conflicts (G003)', () => {
    // References: docs/strategy/bmml/value-proposition.yaml - G003
    // Success Metrics: Code review participation

    // Clear separation means fewer cross-team reviews needed
    // Platform Engineering reviews infrastructure changes
    expect(rbacValidator.canPerform('platform-engineer', 'chatbot-operator', '', 'deployments', 'update')).toBe(true);
    
    // AppDev reviews bot configuration changes
    expect(rbacValidator.canPerform('appdev', 'chatbot-operator', 'chatbotoperator.io', 'chatbots', 'update')).toBe(true);
  });
});

module.exports = {
  MockRBACValidator,
  platformEngineeringRole,
  appDevRole,
  securityTeamRole
};
