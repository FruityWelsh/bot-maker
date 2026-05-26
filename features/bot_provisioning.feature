# Bot Provisioning Feature
# ========================
# 
# Feature: Automated Bot Account Creation and Configuration
# References: docs/strategy/omen/strategy.json (Application Goal AG002)
# References: docs/strategy/bmml/value-proposition.yaml (Goal G002)
# References: docs/contributors/adr/application-adrs.md (ADR-003)
#
# This feature validates Application Goal AG002: "Implement automated account creation and configuration"
# Success Criteria: Bots can be created, configured, and managed via Kubernetes API

@AG002 @G002 @ADR-001 @ADR-003
Feature: Automated Bot Account Creation
  As a Platform Engineering or Application Development team member
  I want to manage chat bot lifecycles as Kubernetes resources
  So that I can automate bot provisioning, configuration, and management

  Background:
    Given the ChatBot Operator is deployed in RKE2 cluster with Linkerd
    And the operator has proper RBAC/ABAC permissions
    And the BotPlatform CRDs are defined for all supported platforms

  # AG002: Automated Account Creation
  # ==================================

  @AG002 @G002 @crd @provisioning
  Scenario: Create a new ChatBot resource for Slack platform
    # References: docs/strategy/omen/strategy.json - AG002
    # References: docs/strategy/bmml/value-proposition.yaml - G002
    # References: docs/contributors/adr/application-adrs.md - ADR-003
    Given I have a valid ChatBot manifest for platform "slack"
    When I apply the ChatBot manifest to Kubernetes
    Then the ChatBot resource should be created successfully
    And the bot account should be automatically provisioned
    And the bot should have a valid BotID
    And the bot should have a valid BotToken
    And the bot should have a valid WebhookURL
    And the bot status should transition to "Ready"

  @AG002 @G002 @crd @provisioning
  Scenario: Create a new ChatBot resource for Matrix platform
    Given I have a valid ChatBot manifest for platform "matrix"
    When I apply the ChatBot manifest to Kubernetes
    Then the ChatBot resource should be created successfully
    And the bot account should be automatically provisioned
    And the bot status should transition to "Ready"

  @AG002 @G002 @crd @provisioning
  Scenario: Create a new ChatBot resource for Discord platform
    Given I have a valid ChatBot manifest for platform "discord"
    When I apply the ChatBot manifest to Kubernetes
    Then the ChatBot resource should be created successfully
    And the bot account should be automatically provisioned
    And the bot status should transition to "Ready"

  @AG002 @G002 @crd @provisioning
  Scenario: Create a new ChatBot resource for Twilio platform
    Given I have a valid ChatBot manifest for platform "twilio"
    When I apply the ChatBot manifest to Kubernetes
    Then the ChatBot resource should be created successfully
    And the bot account should be automatically provisioned
    And the bot status should transition to "Ready"

  @AG002 @G002 @validation
  Scenario: Create a ChatBot with invalid specification
    # References: features/chatbot.feature - "Create a ChatBot with invalid specification"
    Given I have an invalid ChatBot manifest with missing required fields
    When I apply the ChatBot manifest to Kubernetes
    Then the ChatBot resource should be rejected
    And the status should indicate validation failure
    And the error message should specify the missing fields

  @AG002 @G002 @validation
  Scenario: Create a ChatBot with unsupported platform
    Given I have a ChatBot manifest for platform "unsupported-platform"
    When I apply the ChatBot manifest to Kubernetes
    Then the ChatBot resource should be rejected
    And the status should indicate invalid platform

  # AG002: Configuration Management
  # ===============================

  @AG002 @G002 @crd @configuration
  Scenario: Configure bot with platform-specific settings
    # References: docs/strategy/bmml/value-proposition.yaml - G002
    # References: docs/contributors/adr/application-adrs.md - ADR-003
    Given I have a valid ChatBot manifest with platform-specific configuration
    When I apply the ChatBot manifest to Kubernetes
    Then the bot should be configured with the specified settings
    And the configuration should be validated against the platform schema

  @AG002 @G002 @crd @update
  Scenario: Update bot configuration
    Given I have a ChatBot resource in "Ready" state
    When I update the ChatBot specification
    Then the bot configuration should be updated
    And the bot should remain in "Ready" state
    And the update should be reflected in the bot's status

  @AG002 @G002 @crd @lifecycle
  Scenario: Delete a ChatBot resource
    Given I have a ChatBot resource in "Ready" state
    When I delete the ChatBot resource
    Then the bot account should be deprovisioned
    And the bot should be removed from the platform
    And the Kubernetes resources should be cleaned up
    And the ChatBot resource should transition to "Deleted" state

  @AG002 @G002 @crd @lifecycle
  Scenario: Disable and re-enable a ChatBot
    Given I have a ChatBot resource in "Ready" state
    When I set the enabled field to false
    Then the bot should transition to "Terminating" state
    When I set the enabled field back to true
    Then the bot should transition back to "Ready" state

  # AG002: Multi-Platform Support
  # =============================

  @AG002 @G002 @ADR-003 @multi-platform
  Scenario: Verify all supported platforms can be provisioned
    # References: docs/contributors/adr/application-adrs.md - ADR-003
    # References: docs/strategy/bmml/value-proposition.yaml - G002
    Given I have ChatBot manifests for all supported platforms
    When I apply each ChatBot manifest to Kubernetes
    Then all bots should be created successfully
    And all bots should be provisioned with platform-specific configurations

  @AG002 @G002 @ADR-003 @validation
  Scenario: Verify platform-specific validation
    Given I have a ChatBot manifest with invalid platform-specific configuration
    When I apply the ChatBot manifest to Kubernetes
    Then the validation should fail
    And the error should specify the invalid configuration

  # AG002: Success Metrics Validation
  # ==================================

  @AG002 @G002 @metrics
  Scenario: Validate number of supported platforms
    # References: docs/strategy/bmml/value-proposition.yaml - G002 success_metrics
    Given the ChatBot Operator is running
    When I query the supported platforms
    Then the number of supported platforms should be at least 4
    And the platforms should include "slack"
    And the platforms should include "matrix"
    And the platforms should include "discord"
    And the platforms should include "twilio"

  @AG002 @G002 @metrics
  Scenario: Validate CRD adoption rate
    # References: docs/strategy/bmml/value-proposition.yaml - G001 success_metrics
    Given the ChatBot Operator is running
    When I query the CRD adoption
    Then all CRDs should be registered
    And the CRDs should include "ChatBot"
    And the CRDs should include "BotPlatform"
    And the CRDs should include "BotConfiguration"
    And the CRDs should include "BotCredential"

  @AG002 @G002 @metrics @performance
  Scenario: Validate provisioning time
    # References: docs/strategy/bmml/value-proposition.yaml - G002 success_metrics
    Given I have a valid ChatBot manifest
    When I apply the ChatBot manifest and measure the provisioning time
    Then the provisioning time should be less than 300 seconds
    And the provisioning time should be recorded in the bot metrics

  @AG002 @G002 @metrics
  Scenario: Validate reduction in manual intervention
    # References: docs/strategy/bmml/value-proposition.yaml - G002 success_metrics
    Given I have created multiple ChatBot resources
    When I check the operator logs
    Then there should be no manual intervention errors
    And all bots should be in "Ready" or "Failed" state (not stuck in intermediate states)

  # AG002: Integration with Platform Engineering
  # ============================================

  @AG002 @AG003 @G002 @rbac
  Scenario: Platform Engineering can manage infrastructure
    # References: docs/strategy/omen/strategy.json - AG003
    Given I am authenticated as a Platform Engineering user
    And I have the appropriate RBAC permissions
    When I create a BotPlatform resource
    Then the BotPlatform should be created successfully
    And I should be able to configure cluster-wide settings

  @AG002 @AG003 @G002 @rbac
  Scenario: AppDev can manage bot configuration
    # References: docs/strategy/omen/strategy.json - AG003
    Given I am authenticated as an AppDev user
    And I have the appropriate RBAC permissions
    When I create a ChatBot resource
    Then the ChatBot should be created successfully
    And I should be able to configure bot-specific settings
    But I should NOT be able to configure cluster-wide settings
