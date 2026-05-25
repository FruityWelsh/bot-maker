# Operator Controller Feature Tests
# ====================================
# Formal verification tests for the ChatBot Operator controller
# References: docs/omen/strategy.json (Application Goal AG001, AG002)
# References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
# References: config/crd/bases/chatbotoperator.io_*.yaml (CRD definitions)

Feature: Operator Controller
  As a ChatBot Operator
  I want the controller to manage chat bot lifecycles
  So that bots are automatically provisioned, configured, and managed

  Background:
    Given the ChatBot Operator is deployed in the cluster
    And the operator has proper RBAC permissions
    And the CRDs are installed
    And the operator is running with Linkerd service mesh

---

## Controller Initialization Scenarios

  Scenario: Controller starts successfully
    Given the ChatBot Operator is deployed
    When the controller starts
    Then the controller should initialize successfully
    And the controller should register event handlers for ChatBot resources
    And the controller should register event handlers for BotPlatform resources
    And the controller should register event handlers for BotConfiguration resources
    And the controller should register event handlers for BotCredential resources
    And the controller should start informers for all CRDs
    And the controller should start workers for reconciliation

  Scenario: Controller handles startup errors gracefully
    Given the ChatBot Operator is deployed
    And there is a configuration error
    When the controller starts
    Then the controller should log the error
    And the controller should retry initialization
    And the controller should not crash
    And the operator pod should remain running

  Scenario: Controller registers finalizers
    Given the ChatBot Operator is deployed
    When the controller starts
    Then the controller should register finalizers for ChatBot resources
    And the finalizers should prevent deletion while resources are in use

---

## Reconciliation Scenarios

  Scenario: Reconcile new ChatBot resource
    Given I have a valid ChatBot manifest for platform "slack"
    When I create the ChatBot resource
    Then the controller should detect the new resource
    And the controller should start reconciliation
    And the resource status should transition to "Pending"
    And the controller should create the BotPlatform if it doesn't exist
    And the controller should create the BotCredential if it doesn't exist
    And the controller should call the SlackProvisioner
    And the resource status should transition to "Provisioning"

  Scenario: Reconcile ChatBot with existing BotPlatform
    Given I have a BotPlatform resource for "slack"
    And I create a ChatBot resource for platform "slack"
    When the controller reconciles the ChatBot
    Then the controller should use the existing BotPlatform
    And the controller should not create a new BotPlatform
    And the controller should call the SlackProvisioner with the existing BotPlatform

  Scenario: Reconcile ChatBot with BotConfiguration
    Given I have a ChatBot resource in "Ready" state
    And I create a BotConfiguration resource for that ChatBot
    When the controller reconciles the BotConfiguration
    Then the controller should apply the configuration to the ChatBot
    And the BotConfiguration status should transition to "Applying"
    And the configuration should be applied to the bot instance
    And the BotConfiguration status should transition to "Ready"

  Scenario: Reconcile ChatBot with BotCredential
    Given I have a ChatBot resource in "Ready" state
    And I create a BotCredential resource for that ChatBot
    When the controller reconciles the BotCredential
    Then the controller should store the credential securely
    And the BotCredential status should transition to "Creating"
    And the credential should be stored in a Kubernetes Secret
    And the BotCredential status should transition to "Ready"

  Scenario: Reconcile ChatBot update
    Given I have a ChatBot resource in "Ready" state
    When I update the ChatBot specification
    Then the controller should detect the update
    And the controller should start reconciliation
    And the resource status should transition to "Updating"
    And the controller should apply the changes
    And the resource status should transition back to "Ready"

  Scenario: Reconcile ChatBot deletion
    Given I have a ChatBot resource in "Ready" state
    When I delete the ChatBot resource
    Then the controller should detect the deletion
    And the controller should start cleanup
    And the resource status should transition to "Terminating"
    And the controller should deprovision the bot
    And the controller should clean up all related resources
    And the resource should be removed

---

## Provisioner Scenarios

  Scenario: SlackProvisioner creates bot successfully
    Given I have a ChatBot resource for platform "slack"
    And the SlackProvisioner is configured
    And valid Slack credentials are available
    When the controller calls the SlackProvisioner
    Then the SlackProvisioner should create a new Slack bot
    And the bot should be configured with the specified settings
    And the bot credentials should be stored securely
    And the ChatBot status should be updated with the botID
    And the ChatBot status should transition to "Ready"

  Scenario: MatrixProvisioner creates bot successfully
    Given I have a ChatBot resource for platform "matrix"
    And the MatrixProvisioner is configured
    And valid Matrix credentials are available
    When the controller calls the MatrixProvisioner
    Then the MatrixProvisioner should create a new Matrix bot
    And the bot should be configured with the specified homeserver
    And the bot should be added to the specified rooms
    And the ChatBot status should transition to "Ready"

  Scenario: DiscordProvisioner creates bot successfully
    Given I have a ChatBot resource for platform "discord"
    And the DiscordProvisioner is configured
    And valid Discord credentials are available
    When the controller calls the DiscordProvisioner
    Then the DiscordProvisioner should create a new Discord bot
    And the bot should be added to the specified guilds
    And the bot should have the specified permissions
    And the ChatBot status should transition to "Ready"

  Scenario: TwilioProvisioner provisions phone number successfully
    Given I have a ChatBot resource for platform "twilio"
    And the TwilioProvisioner is configured
    And valid Twilio credentials are available
    When the controller calls the TwilioProvisioner
    Then the TwilioProvisioner should provision a new phone number
    And the bot should be configured with the specified webhook
    And the ChatBot status should transition to "Ready"

  Scenario: Provisioner handles API errors gracefully
    Given I have a ChatBot resource for platform "slack"
    And the Slack API is unavailable
    When the controller calls the SlackProvisioner
    Then the provisioning should fail gracefully
    And the ChatBot status should transition to "Failed"
    And the error message should indicate the API error
    And the controller should retry provisioning

  Scenario: Provisioner retries on failure
    Given I have a ChatBot resource for platform "slack"
    And the Slack API is temporarily unavailable
    And the retry configuration is set to 3 attempts
    When the controller calls the SlackProvisioner
    Then the provisioner should retry 3 times
    And if all retries fail, the ChatBot status should transition to "Failed"
    And the error should indicate all retries exhausted

---

## Status Management Scenarios

  Scenario: Update ChatBot status on provisioning start
    Given I have a ChatBot resource in "Pending" state
    When the controller starts provisioning
    Then the controller should update the status to "Provisioning"
    And the status should include provisioningStartTime
    And the status should include message "Starting provisioning"

  Scenario: Update ChatBot status on provisioning success
    Given I have a ChatBot resource in "Provisioning" state
    And the provisioner completes successfully
    When the controller detects provisioning success
    Then the controller should update the status to "Ready"
    And the status should include readyTime
    And the status should include botID
    And the status should include webhookURL
    And the status should include message "Bot provisioned successfully"

  Scenario: Update ChatBot status on provisioning failure
    Given I have a ChatBot resource in "Provisioning" state
    And the provisioner fails
    When the controller detects provisioning failure
    Then the controller should update the status to "Failed"
    And the status should include lastError with message
    And the status should include lastError with time
    And the status should include lastError with count

  Scenario: Update ChatBot status on configuration change
    Given I have a ChatBot resource in "Ready" state
    And I update the BotConfiguration
    When the controller applies the new configuration
    Then the controller should update the status to "Updating"
    And after configuration is applied, the status should return to "Ready"

  Scenario: Update ChatBot status on deprovisioning
    Given I have a ChatBot resource in "Ready" state
    And I delete the ChatBot resource
    When the controller starts deprovisioning
    Then the controller should update the status to "Terminating"
    And the status should include message "Starting deprovisioning"

---

## Error Handling Scenarios

  Scenario: Handle invalid ChatBot specification
    Given I have a ChatBot resource with invalid specification
    When the controller tries to reconcile the resource
    Then the controller should detect the validation error
    And the ChatBot status should transition to "Failed"
    And the error message should indicate the validation failure
    And the error should reference the specific validation issue

  Scenario: Handle missing BotPlatform
    Given I have a ChatBot resource for platform "slack"
    And there is no BotPlatform resource for "slack"
    When the controller tries to reconcile the ChatBot
    Then the controller should detect the missing BotPlatform
    And the ChatBot status should transition to "Failed"
    And the error message should indicate missing BotPlatform

  Scenario: Handle provisioner timeout
    Given I have a ChatBot resource for platform "slack"
    And the provisioner takes longer than the timeout
    When the controller detects the timeout
    Then the ChatBot status should transition to "Failed"
    And the error message should indicate provisioning timeout
    And the controller should retry provisioning

  Scenario: Handle credential errors
    Given I have a ChatBot resource for platform "slack"
    And the credentials are invalid
    When the controller tries to provision the bot
    Then the provisioning should fail
    And the ChatBot status should transition to "Failed"
    And the error message should indicate credential error

---

## Webhook Management Scenarios

  Scenario: Create webhook for Slack bot
    Given I have a ChatBot resource for platform "slack"
    And the bot is provisioned successfully
    When the controller creates the webhook
    Then the webhook should be created with the correct URL
    And the webhook should be configured with the correct path
    And the webhook should be secured with TLS
    And the webhook URL should be stored in the ChatBot status

  Scenario: Verify webhook URL format
    Given I have a ChatBot resource for platform "slack"
    And the bot is provisioned
    When I check the webhook URL in the status
    Then the URL should be a valid HTTPS URL
    And the URL should include the bot name
    And the URL should include the platform
    And the URL should include a unique identifier

  Scenario: Handle webhook creation failure
    Given I have a ChatBot resource for platform "slack"
    And the webhook service is unavailable
    When the controller tries to create the webhook
    Then the webhook creation should fail
    And the ChatBot status should transition to "Failed"
    And the error message should indicate webhook creation failure

---

## Metrics Collection Scenarios

  Scenario: Collect provisioning metrics
    Given I have a ChatBot resource
    And the bot is provisioned successfully
    When the controller completes provisioning
    Then the controller should record provisioning time
    And the provisioning time should be recorded in Cube.js metrics
    And the metrics should include platform dimension
    And the metrics should include region dimension

  Scenario: Collect error metrics
    Given I have a ChatBot resource
    And provisioning fails
    When the controller detects the failure
    Then the controller should record the failure in metrics
    And the failure should be recorded in Cube.js metrics
    And the metrics should include failure type
    And the metrics should include severity

  Scenario: Collect message processing metrics
    Given I have a ChatBot resource in "Ready" state
    And the bot processes messages
    When the bot processes a message
    Then the controller should record the message in metrics
    And the message count should be incremented
    And the last message time should be updated

---

## Security Scenarios

  Scenario: Enforce RBAC for ChatBot resources
    Given I have a user with "bot-developer" role
    And I have a ChatBot manifest
    When the user creates a ChatBot resource
    Then the controller should allow the creation
    And the ChatBot should be created in the user's namespace

  Scenario: Prevent unauthorized ChatBot creation
    Given I have a user with "viewer" role
    And I have a ChatBot manifest
    When the user tries to create a ChatBot resource
    Then the controller should deny the creation
    And the error should indicate permission denied

  Scenario: Enforce OPA policies
    Given I have OPA policies configured
    And I have a ChatBot manifest with specific labels
    When I create the ChatBot resource
    Then the controller should evaluate the OPA policies
    And the creation should be allowed if policies permit
    And the creation should be denied if policies forbid

  Scenario: Secure webhook with Linkerd
    Given the ChatBot Operator is deployed with Linkerd
    And I have a ChatBot resource
    When the webhook is created
    Then the webhook should be secured with mTLS
    And the traffic should be routed through the service mesh
    And the service identity should be verified

---

## Scaling Scenarios

  Scenario: Handle multiple ChatBot resources
    Given I have 10 ChatBot resources
    And the controller is running
    When I create 10 more ChatBot resources
    Then the controller should handle all 20 resources
    And all resources should be reconciled
    And the controller should not crash

  Scenario: Handle concurrent reconciliation
    Given I have 100 ChatBot resources
    And the controller is running with 10 workers
    When I create 10 more ChatBot resources simultaneously
    Then the controller should handle concurrent reconciliation
    And all resources should be reconciled
    And there should be no race conditions

  Scenario: Handle controller scaling
    Given I have 1000 ChatBot resources
    And the controller is running with 1 replica
    When I scale the controller to 3 replicas
    Then the work should be distributed across all replicas
    And there should be no duplicate work
    And all resources should be reconciled

---

## Cleanup Scenarios

  Scenario: Clean up on ChatBot deletion
    Given I have a ChatBot resource in "Ready" state
    And the bot has associated resources (BotConfiguration, BotCredential, Secret)
    When I delete the ChatBot resource
    Then the controller should clean up all associated resources
    And the BotConfiguration should be deleted
    And the BotCredential should be deleted
    And the Secret should be deleted
    And the webhook should be deleted

  Scenario: Handle cleanup failure gracefully
    Given I have a ChatBot resource in "Ready" state
    And the cleanup of associated resources fails
    When I delete the ChatBot resource
    Then the controller should continue cleanup
    And the ChatBot should enter "Terminating" state
    And the controller should retry cleanup
    And the error should be logged

  Scenario: Verify cleanup is complete
    Given I have a ChatBot resource in "Terminating" state
    And all associated resources are cleaned up
    When the controller verifies cleanup
    Then the ChatBot resource should be removed
    And the finalizer should be removed

---

## Health Check Scenarios

  Scenario: Controller health check passes
    Given the ChatBot Operator is deployed
    And the controller is running
    When I check the controller health endpoint
    Then the health check should pass
    And the response should indicate healthy

  Scenario: Controller health check fails on error
    Given the ChatBot Operator is deployed
    And the controller has encountered an error
    When I check the controller health endpoint
    Then the health check should fail
    And the response should indicate unhealthy
    And the response should include error details

  Scenario: Controller readiness check passes
    Given the ChatBot Operator is deployed
    And the controller is running and ready
    When I check the controller readiness endpoint
    Then the readiness check should pass
    And the response should indicate ready

  Scenario: Controller readiness check fails during startup
    Given the ChatBot Operator is deployed
    And the controller is starting up
    When I check the controller readiness endpoint
    Then the readiness check should fail
    And the response should indicate not ready

---

# References: docs/omen/strategy.json (Application Goal AG001, AG002)
# References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
# References: config/crd/bases/chatbotoperator.io_*.yaml (CRD definitions)
