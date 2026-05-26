# Separation of Concerns Feature
# ================================
# 
# Feature: Separation of Concerns between Platform Engineering and AppDev
# References: docs/strategy/omen/strategy.json (Application Goal AG003)
# References: docs/strategy/bmml/value-proposition.yaml (Goal G003)
# References: docs/contributors/adr/application-adrs.md (ADR-004, ADR-005)
#
# This feature validates Application Goal AG003: "Maintain separation of concerns between
# Platform Engineering and AppDev" with clear responsibility boundaries.

@AG003 @G003 @ADR-004 @ADR-005
Feature: Separation of Concerns
  As a system architect
  I want clear separation between Platform Engineering and AppDev responsibilities
  So that we can reduce conflicts and improve maintainability

  Background:
    Given the ChatBot Operator is deployed in RKE2 cluster with Linkerd
    And the operator has proper RBAC/ABAC permissions configured
    And Platform Engineering and AppDev teams have distinct responsibilities

  # AG003: Platform Engineering Responsibilities
  # ================================================

  @AG003 @platform-engineering @infrastructure
  Scenario: Platform Engineering can manage cluster configuration
    # References: docs/strategy/omen/strategy.json - AG003
    # References: docs/strategy/omen/strategy.json - Platform Engineering responsibilities
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I create a Deployment resource
    Then the Deployment should be created successfully
    
    When I create a Service resource
    Then the Service should be created successfully
    
    When I create a ConfigMap resource
    Then the ConfigMap should be created successfully
    
    When I create a Secret resource
    Then the Secret should be created successfully

  @AG003 @platform-engineering @bot-platform
  Scenario: Platform Engineering can manage BotPlatform resources
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I create a BotPlatform resource for Slack
    Then the BotPlatform should be created successfully
    
    When I update the BotPlatform configuration
    Then the BotPlatform should be updated successfully
    
    When I delete the BotPlatform resource
    Then the BotPlatform should be deleted successfully

  @AG003 @AG004 @platform-engineering @security
  Scenario: Platform Engineering can manage RBAC and security policies
    # References: docs/strategy/omen/strategy.json - AG003, AG004
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I create a Role resource
    Then the Role should be created successfully
    
    When I create a RoleBinding resource
    Then the RoleBinding should be created successfully
    
    When I create a NetworkPolicy resource
    Then the NetworkPolicy should be created successfully

  @AG003 @AG004 @platform-engineering @service-mesh
  Scenario: Platform Engineering can configure service mesh
    # References: docs/strategy/omen/strategy.json - AG003, AG004
    # References: docs/contributors/adr/application-adrs.md - ADR-004
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I create a Linkerd configuration
    Then the Linkerd configuration should be applied successfully
    
    When I create a NetworkPolicy for mTLS
    Then the NetworkPolicy should be created successfully

  @AG003 @platform-engineering @monitoring
  Scenario: Platform Engineering can configure monitoring
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I create a ServiceMonitor resource
    Then the ServiceMonitor should be created successfully
    
    When I create a PrometheusRule resource
    Then the PrometheusRule should be created successfully

  @AG003 @platform-engineering @negative
  Scenario: Platform Engineering CANNOT manage ChatBot resources
    # References: docs/strategy/omen/strategy.json - AG003
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I attempt to create a ChatBot resource
    Then the request should be denied with "Forbidden" error
    
    When I attempt to update a ChatBot resource
    Then the request should be denied with "Forbidden" error
    
    When I attempt to delete a ChatBot resource
    Then the request should be denied with "Forbidden" error

  @AG003 @platform-engineering @negative
  Scenario: Platform Engineering CANNOT manage BotConfiguration resources
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I attempt to create a BotConfiguration resource
    Then the request should be denied with "Forbidden" error

  @AG003 @platform-engineering @negative
  Scenario: Platform Engineering CANNOT manage BotCredential resources
    Given I am authenticated as a Platform Engineering user
    And I have the Platform Engineering role
    When I attempt to create a BotCredential resource
    Then the request should be denied with "Forbidden" error

  # AG003: AppDev Responsibilities
  # ==============================

  @AG003 @appdev @bot-management
  Scenario: AppDev can manage ChatBot resources
    # References: docs/strategy/omen/strategy.json - AG003
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I create a ChatBot resource for Slack
    Then the ChatBot should be created successfully
    
    When I update the ChatBot configuration
    Then the ChatBot should be updated successfully
    
    When I delete the ChatBot resource
    Then the ChatBot should be deleted successfully

  @AG003 @appdev @bot-configuration
  Scenario: AppDev can manage BotConfiguration resources
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I create a BotConfiguration resource
    Then the BotConfiguration should be created successfully
    
    When I update the BotConfiguration
    Then the BotConfiguration should be updated successfully
    
    When I delete the BotConfiguration
    Then the BotConfiguration should be deleted successfully

  @AG003 @appdev @credentials
  Scenario: AppDev can manage BotCredential resources
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I create a BotCredential resource
    Then the BotCredential should be created successfully
    
    When I update the BotCredential
    Then the BotCredential should be updated successfully

  @AG003 @appdev @secrets-read
  Scenario: AppDev can read Secrets for bot configuration
    # References: docs/strategy/omen/strategy.json - AG003
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    And there is a Secret containing bot credentials
    When I get the Secret
    Then I should be able to read the Secret
    
    When I list Secrets
    Then I should see the Secret in the list
    
    When I watch Secrets
    Then I should receive Secret events

  @AG003 @appdev @negative
  Scenario: AppDev CANNOT create Secrets
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I attempt to create a Secret
    Then the request should be denied with "Forbidden" error

  @AG003 @appdev @negative
  Scenario: AppDev CANNOT update Secrets
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    And there is an existing Secret
    When I attempt to update the Secret
    Then the request should be denied with "Forbidden" error

  @AG003 @appdev @negative
  Scenario: AppDev CANNOT delete Secrets
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    And there is an existing Secret
    When I attempt to delete the Secret
    Then the request should be denied with "Forbidden" error

  @AG003 @appdev @negative
  Scenario: AppDev CANNOT manage infrastructure
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I attempt to create a Deployment resource
    Then the request should be denied with "Forbidden" error
    
    When I attempt to create a Service resource
    Then the request should be denied with "Forbidden" error

  @AG003 @appdev @negative
  Scenario: AppDev CANNOT manage BotPlatform resources
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I attempt to create a BotPlatform resource
    Then the request should be denied with "Forbidden" error

  @AG003 @appdev @negative
  Scenario: AppDev CANNOT manage RBAC policies
    Given I am authenticated as an AppDev user
    And I have the AppDev role
    When I attempt to create a Role resource
    Then the request should be denied with "Forbidden" error
    
    When I attempt to create a RoleBinding resource
    Then the request should be denied with "Forbidden" error

  # AG003: Cross-Team Validation
  # ============================

  @AG003 @cross-team @validation
  Scenario: Verify clear responsibility boundaries
    # References: docs/strategy/omen/strategy.json - AG003
    # Success Criteria: Clear responsibility boundaries and reduced conflicts
    Given I query the RBAC configuration
    When I compare Platform Engineering and AppDev permissions
    Then Platform Engineering should have permissions for:
      | Resource | Verbs |
      | deployment | create, update, delete |
      | service | create, update, delete |
      | botplatform | create, update, delete |
    
    And AppDev should have permissions for:
      | Resource | Verbs |
      | chatbot | create, update, delete |
      | botconfiguration | create, update, delete |
      | botcredential | create, update, delete |
    
    And there should be no overlap in write permissions

  @AG003 @cross-team @independent-deployment
  Scenario: Teams can deploy independently
    # References: docs/strategy/omen/strategy.json - AG003
    # Success Criteria: Deployment frequency per team
    Given Platform Engineering has updated the BotPlatform configuration
    And AppDev has updated the ChatBot configuration
    When both teams deploy their changes
    Then both deployments should succeed independently
    And the BotPlatform changes should not affect ChatBot resources
    And the ChatBot changes should not affect BotPlatform resources

  @AG003 @cross-team @incident-resolution
  Scenario: Separation improves incident resolution time
    # References: docs/strategy/omen/strategy.json - AG003
    # Success Criteria: Incident resolution time
    Given there is an issue with the BotPlatform configuration
    When Platform Engineering fixes the BotPlatform
    Then the fix should be deployed without waiting for AppDev
    
    Given there is an issue with a ChatBot configuration
    When AppDev fixes the ChatBot
    Then the fix should be deployed without waiting for Platform Engineering

  @AG003 @cross-team @reduced-conflicts
  Scenario: Reduced cross-team dependencies
    # References: docs/strategy/omen/strategy.json - AG003
    # Success Criteria: Number of cross-team dependencies
    Given I analyze the codebase
    When I count cross-team dependencies
    Then the number of dependencies between Platform Engineering and AppDev should be minimal
    And dependencies should only be through well-defined APIs

  # AG003 + AG004: Security by Design
  # ================================

  @AG003 @AG004 @security @zero-trust
  Scenario: Enforce Zero Trust principles
    # References: docs/strategy/omen/strategy.json - AG003, AG004
    # References: docs/contributors/adr/application-adrs.md - ADR-004
    Given the ChatBot Operator is running
    When I check the RBAC configuration
    Then all access should require explicit permissions
    And there should be no wildcard permissions
    And all permissions should be least privilege

  @AG003 @AG004 @security @mTLS
  Scenario: Enforce mutual TLS for service-to-service communication
    # References: docs/strategy/omen/strategy.json - AG004
    # References: docs/contributors/adr/application-adrs.md - ADR-004
    Given the ChatBot Operator is running in a Linkerd-enabled cluster
    When services communicate with each other
    Then all communication should be encrypted with mTLS
    And service authentication should be required

  @AG003 @AG004 @security @rbac
  Scenario: Enforce RBAC/ABAC integration
    # References: docs/strategy/omen/strategy.json - AG004
    # References: docs/contributors/adr/application-adrs.md - ADR-005
    Given the ChatBot Operator is running
    When users access resources
    Then access should be granted based on RBAC roles
    And access should be granted based on ABAC attributes
    And access decisions should be audited

  @AG003 @AG004 @security @least-privilege
  Scenario: Enforce least privilege access
    # References: docs/strategy/omen/strategy.json - AG004
    Given the RBAC configuration
    When I review user permissions
    Then each user should have only the permissions they need
    And no user should have admin privileges unless required
    And permissions should be scoped to specific resources where possible

  # AG003: Success Metrics Validation
  # ==================================

  @AG003 @G003 @metrics @responsibility-boundaries
  Scenario: Validate clear responsibility boundaries
    # References: docs/strategy/bmml/value-proposition.yaml - G003 success_metrics
    Given the RBAC configuration
    When I analyze the permission structure
    Then Platform Engineering should have clear ownership of infrastructure
    And AppDev should have clear ownership of bot resources
    And there should be minimal overlap between the two

  @AG003 @G003 @metrics @deployment-frequency
  Scenario: Validate deployment frequency per team
    # References: docs/strategy/bmml/value-proposition.yaml - G003 success_metrics
    Given deployment logs for the past month
    When I analyze deployment frequency
    Then both Platform Engineering and AppDev should have regular deployments
    And deployments should not be blocked by the other team

  @AG003 @G003 @metrics @incident-resolution
  Scenario: Validate incident resolution time
    # References: docs/strategy/bmml/value-proposition.yaml - G003 success_metrics
    Given incident logs for the past month
    When I analyze incident resolution times
    Then incidents should be resolved by the appropriate team
    And resolution time should be minimized due to clear ownership
