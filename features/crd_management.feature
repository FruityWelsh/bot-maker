# CRD Management Feature Tests
# ==============================
# Formal verification tests for Custom Resource Definitions
# References: docs/omen/strategy.json (Application Goal AG001)
# References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
# References: config/crd/bases/chatbotoperator.io_*.yaml (CRD definitions)

Feature: CRD Management
  As a Kubernetes administrator
  I want to manage ChatBot Operator CRDs
  So that I can deploy and manage chat bots as Kubernetes resources

  Background:
    Given the ChatBot Operator is installed in the cluster
    And the CRDs are registered:
      | chatbots.chatbotoperator.io |
      | botplatforms.chatbotoperator.io |
      | botconfigurations.chatbotoperator.io |
      | botcredentials.chatbotoperator.io |

---

## CRD Installation Scenarios

  Scenario: Install ChatBot CRD successfully
    Given I have the ChatBot CRD manifest at "config/crd/bases/chatbotoperator.io_chatbots.yaml"
    When I apply the CRD manifest to Kubernetes
    Then the CRD should be created successfully
    And the CRD status should be "Established"
    And the CRD should have the correct group "chatbotoperator.io"
    And the CRD should have the correct kind "ChatBot"
    And the CRD should have the correct plural "chatbots"
    And the CRD should support the version "v1alpha1"
    And the CRD should be namespaced

  Scenario: Install BotPlatform CRD successfully
    Given I have the BotPlatform CRD manifest at "config/crd/bases/chatbotoperator.io_botplatforms.yaml"
    When I apply the CRD manifest to Kubernetes
    Then the CRD should be created successfully
    And the CRD status should be "Established"
    And the CRD should have the correct group "chatbotoperator.io"
    And the CRD should have the correct kind "BotPlatform"
    And the CRD should have the correct plural "botplatforms"

  Scenario: Install BotConfiguration CRD successfully
    Given I have the BotConfiguration CRD manifest at "config/crd/bases/chatbotoperator.io_botconfigurations.yaml"
    When I apply the CRD manifest to Kubernetes
    Then the CRD should be created successfully
    And the CRD status should be "Established"
    And the CRD should have the correct group "chatbotoperator.io"
    And the CRD should have the correct kind "BotConfiguration"
    And the CRD should have the correct plural "botconfigurations"

  Scenario: Install BotCredential CRD successfully
    Given I have the BotCredential CRD manifest at "config/crd/bases/chatbotoperator.io_botcredentials.yaml"
    When I apply the CRD manifest to Kubernetes
    Then the CRD should be created successfully
    And the CRD status should be "Established"
    And the CRD should have the correct group "chatbotoperator.io"
    And the CRD should have the correct kind "BotCredential"
    And the CRD should have the correct plural "botcredentials"

  Scenario: Install all CRDs together successfully
    Given I have all CRD manifests in "config/crd/bases/"
    When I apply all CRD manifests to Kubernetes
    Then all CRDs should be created successfully
    And all CRDs should have status "Established"
    And the cluster should have 4 new CRDs

  Scenario: Handle CRD installation failure gracefully
    Given I have an invalid CRD manifest
    When I apply the invalid CRD manifest to Kubernetes
    Then the CRD should not be created
    And the error should indicate validation failure
    And the error should reference the specific validation issue

---

## CRD Validation Scenarios

  Scenario: Validate ChatBot CRD schema
    Given the ChatBot CRD is installed
    When I create a ChatBot resource with valid schema
    Then the resource should be created successfully
    And the resource should pass schema validation

  Scenario: Reject ChatBot with missing required fields
    Given the ChatBot CRD is installed
    When I create a ChatBot resource without the required "platform" field
    Then the resource should be rejected
    And the error should indicate missing required field "platform"

  Scenario: Reject ChatBot with invalid platform value
    Given the ChatBot CRD is installed
    When I create a ChatBot resource with platform "invalid-platform"
    Then the resource should be rejected
    And the error should indicate invalid enum value
    And the error should list valid values: slack, matrix, discord, twilio

  Scenario: Reject ChatBot with name exceeding 63 characters
    Given the ChatBot CRD is installed
    When I create a ChatBot resource with name "this-name-is-way-too-long-and-exceeds-the-maximum-allowed-length-of-63-characters"
    Then the resource should be rejected
    And the error should indicate name exceeds maximum length

  Scenario: Validate BotPlatform CRD schema
    Given the BotPlatform CRD is installed
    When I create a BotPlatform resource with valid schema
    Then the resource should be created successfully
    And the resource should pass schema validation

  Scenario: Reject BotPlatform with missing required fields
    Given the BotPlatform CRD is installed
    When I create a BotPlatform resource without the required "platformType" field
    Then the resource should be rejected
    And the error should indicate missing required field "platformType"

  Scenario: Validate BotConfiguration CRD schema
    Given the BotConfiguration CRD is installed
    When I create a BotConfiguration resource with valid schema
    Then the resource should be created successfully
    And the resource should pass schema validation

  Scenario: Reject BotConfiguration with missing chatBotRef
    Given the BotConfiguration CRD is installed
    When I create a BotConfiguration resource without the required "chatBotRef" field
    Then the resource should be rejected
    And the error should indicate missing required field "chatBotRef"

  Scenario: Validate BotCredential CRD schema
    Given the BotCredential CRD is installed
    When I create a BotCredential resource with valid schema
    Then the resource should be created successfully
    And the resource should pass schema validation

  Scenario: Reject BotCredential with missing required fields
    Given the BotCredential CRD is installed
    When I create a BotCredential resource without the required "credentialType" field
    Then the resource should be rejected
    And the error should indicate missing required field "credentialType"

---

## CRD Upgrade Scenarios

  Scenario: Upgrade CRD to new version successfully
    Given the ChatBot CRD v1alpha1 is installed
    And I have a ChatBot CRD v1beta1 manifest
    When I apply the v1beta1 CRD manifest
    Then the CRD should be upgraded successfully
    And the old version should still be served
    And the new version should be storage
    And existing resources should remain accessible

  Scenario: Handle CRD upgrade with breaking changes
    Given the ChatBot CRD v1alpha1 is installed
    And I have a ChatBot CRD v1beta1 manifest with breaking changes
    When I apply the v1beta1 CRD manifest
    Then the CRD should be upgraded
    But existing resources should fail validation
    And the error should indicate incompatible schema changes

---

## CRD Deletion Scenarios

  Scenario: Delete CRD with existing resources
    Given the ChatBot CRD is installed
    And there are existing ChatBot resources
    When I delete the ChatBot CRD
    Then the CRD should be deleted
    And the existing resources should be preserved (but inaccessible)
    And the deletion should follow Kubernetes garbage collection policy

  Scenario: Delete all CRDs successfully
    Given all ChatBot Operator CRDs are installed
    When I delete all CRD manifests
    Then all CRDs should be deleted successfully
    And the cluster should have 4 fewer CRDs

---

## CRD Status Scenarios

  Scenario: Check CRD status after installation
    Given the ChatBot CRD is installed
    When I check the CRD status
    Then the status should have "conditions" array
    And one condition should have type "Established"
    And the "Established" condition should have status "True"
    And the "Established" condition should have reason "FieldManagerEnabled"

  Scenario: Check CRD status with accepted names
    Given the ChatBot CRD is installed
    When I check the CRD status
    Then the status should have "acceptedNames" field
    And the "kind" should be "ChatBot"
    And the "plural" should be "chatbots"
    And the "singular" should be "chatbot"
    And the "shortNames" should include "cb" and "bot"

  Scenario: Check CRD storage version
    Given the ChatBot CRD is installed
    When I check the CRD versions
    Then the "v1alpha1" version should have "storage: true"
    And the "v1alpha1" version should have "served: true"

---

## CRD Metadata Scenarios

  Scenario: Verify CRD annotations
    Given the ChatBot CRD is installed
    When I check the CRD metadata
    Then the annotations should include "description"
    And the annotations should include "author"
    And the annotations should include "version"
    And the annotations should include "references"

  Scenario: Verify CRD labels
    Given the ChatBot CRD is installed
    When I check the CRD metadata
    Then the labels should include "app: chatbot-operator"
    And the labels should include "version: v1alpha1"
    And the labels should include "group: chatbotoperator.io"
    And the labels should include "kind: ChatBot"

---

## CRD Subresource Scenarios

  Scenario: Verify ChatBot has status subresource
    Given the ChatBot CRD is installed
    When I check the CRD spec
    Then the CRD should have "subresources.status: {}" defined
    And I should be able to update the status field

  Scenario: Update ChatBot status successfully
    Given the ChatBot CRD is installed
    And I have a ChatBot resource in "Pending" state
    When I update the status to "Provisioning"
    Then the status should be updated successfully
    And the lastTransitionTime should be updated

---

## CRD Additional Printer Columns Scenarios

  Scenario: Verify ChatBot has additional printer columns
    Given the ChatBot CRD is installed
    When I list ChatBot resources with kubectl
    Then the output should include "Platform" column
    And the output should include "Name" column
    And the output should include "Phase" column
    And the output should include "Age" column
    And the output should include "Bot ID" column

  Scenario: Verify BotPlatform has additional printer columns
    Given the BotPlatform CRD is installed
    When I list BotPlatform resources with kubectl
    Then the output should include additional printer columns

---

## CRD Scale Scenarios

  Scenario: Create multiple ChatBot resources
    Given the ChatBot CRD is installed
    When I create 100 ChatBot resources
    Then all 100 resources should be created successfully
    And I should be able to list all 100 resources
    And the list should return all resources

  Scenario: Handle large number of CRDs
    Given the ChatBot CRD is installed
    When I create 1000 ChatBot resources
    Then all resources should be created
    And the API server should handle the load
    And the list operation should be paginated

---

## CRD Security Scenarios

  Scenario: Enforce RBAC on ChatBot CRD
    Given the ChatBot CRD is installed
    And I have a user with "bot-developer" role
    When the user tries to create a ChatBot resource
    Then the request should be allowed
    And the ChatBot should be created

  Scenario: Prevent unauthorized CRD access
    Given the ChatBot CRD is installed
    And I have a user with "viewer" role
    When the user tries to create a ChatBot resource
    Then the request should be denied
    And the error should indicate permission denied

  Scenario: Enforce OPA policies on ChatBot CRD
    Given the ChatBot CRD is installed
    And OPA policies are configured
    When I try to create a ChatBot resource
    Then the OPA should evaluate the policies
    And the request should be allowed if policies permit
    And the request should be denied if policies forbid

---

## CRD Finalizer Scenarios

  Scenario: Verify CRD has finalizers
    Given the ChatBot CRD is installed
    When I check the CRD spec
    Then the CRD should have finalizers defined
    And the finalizers should prevent deletion while resources exist

  Scenario: Delete ChatBot with finalizer
    Given the ChatBot CRD is installed
    And I have a ChatBot resource
    When I delete the ChatBot resource
    Then the resource should enter "Terminating" state
    And the finalizer should run cleanup
    And the resource should only be removed after cleanup is complete

---

## CRD Conversion Scenarios

  Scenario: Convert between CRD versions
    Given the ChatBot CRD has multiple versions
    And I have a ChatBot resource in v1alpha1
    When I request the resource in a different version
    Then the API server should convert the resource
    And the converted resource should have all required fields

  Scenario: Handle conversion webhook
    Given the ChatBot CRD has a conversion webhook configured
    And I have a ChatBot resource in v1alpha1
    When I request the resource in v1beta1
    Then the conversion webhook should be called
    And the resource should be converted to v1beta1
    And the conversion should preserve all data

---

# References: docs/omen/strategy.json (Application Goal AG001)
# References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
# References: config/crd/bases/chatbotoperator.io_*.yaml (CRD definitions)
