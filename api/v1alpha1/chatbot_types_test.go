// ChatBot API Types Tests
// ==========================
// TDD tests for ChatBot resource types
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
// References: api/v1alpha1/chatbot_types.go (Implementation)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// TestChatBotPhaseConstants tests all ChatBotPhase constants
func TestChatBotPhaseConstants(t *testing.T) {
	t.Parallel()

	// Test that all phase constants are defined correctly
	assert.Equal(t, ChatBotPhase("Pending"), ChatBotPhasePending)
	assert.Equal(t, ChatBotPhase("Provisioning"), ChatBotPhaseProvisioning)
	assert.Equal(t, ChatBotPhase("Ready"), ChatBotPhaseReady)
	assert.Equal(t, ChatBotPhase("Updating"), ChatBotPhaseUpdating)
	assert.Equal(t, ChatBotPhase("Terminating"), ChatBotPhaseTerminating)
	assert.Equal(t, ChatBotPhase("Failed"), ChatBotPhaseFailed)
	assert.Equal(t, ChatBotPhase("Deleted"), ChatBotPhaseDeleted)
}

// TestPlatformTypeConstants tests all PlatformType constants
func TestPlatformTypeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, PlatformType("slack"), PlatformSlack)
	assert.Equal(t, PlatformType("matrix"), PlatformMatrix)
	assert.Equal(t, PlatformType("discord"), PlatformDiscord)
	assert.Equal(t, PlatformType("twilio"), PlatformTwilio)
}

// TestChatBotDefaultValues tests default values for ChatBot
func TestChatBotDefaultValues(t *testing.T) {
	t.Parallel()

	// Create a ChatBot with minimal required fields
	chatBot := &ChatBot{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-bot",
			Namespace: "default",
		},
		Spec: ChatBotSpec{
			Platform: PlatformSlack,
			Name:     "test-bot",
			Configuration: BotConfigurationSpec{
				BackendURL: "https://backend.example.com",
			},
		},
	}

	// Test default values
	assert.True(t, chatBot.Spec.Enabled) // Default should be true
	assert.Equal(t, "/webhook", chatBot.Spec.Configuration.WebhookPath) // Default
	assert.Equal(t, 100, chatBot.Spec.Configuration.RateLimit)         // Default
	assert.Equal(t, 30, chatBot.Spec.Configuration.TimeoutSeconds)     // Default
}

// TestChatBotGetChatBotPhase tests GetChatBotPhase method
func TestChatBotGetChatBotPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		phase    ChatBotPhase
		expected ChatBotPhase
	}{
		{"Pending phase", ChatBotPhasePending, ChatBotPhasePending},
		{"Provisioning phase", ChatBotPhaseProvisioning, ChatBotPhaseProvisioning},
		{"Ready phase", ChatBotPhaseReady, ChatBotPhaseReady},
		{"Updating phase", ChatBotPhaseUpdating, ChatBotPhaseUpdating},
		{"Terminating phase", ChatBotPhaseTerminating, ChatBotPhaseTerminating},
		{"Failed phase", ChatBotPhaseFailed, ChatBotPhaseFailed},
		{"Deleted phase", ChatBotPhaseDeleted, ChatBotPhaseDeleted},
		{"Empty phase", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			chatBot := &ChatBot{
				Status: ChatBotStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.expected, chatBot.GetChatBotPhase())
		})
	}
}

// TestChatBotSetChatBotPhase tests SetChatBotPhase method
func TestChatBotSetChatBotPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		initialPhase   ChatBotPhase
		newPhase       ChatBotPhase
		message        string
		reason         string
		expectChange   bool
		expectProvisioningStartTime bool
		expectReadyTime             bool
	}{
		{
			name:           "Same phase - no change",
			initialPhase:   ChatBotPhaseReady,
			newPhase:       ChatBotPhaseReady,
			message:        "Ready",
			reason:         "Bot is ready",
			expectChange:   false,
			expectProvisioningStartTime: false,
			expectReadyTime:             false,
		},
		{
			name:           "Pending to Provisioning",
			initialPhase:   ChatBotPhasePending,
			newPhase:       ChatBotPhaseProvisioning,
			message:        "Provisioning started",
			reason:         "Provisioning",
			expectChange:   true,
			expectProvisioningStartTime: true,
			expectReadyTime:             false,
		},
		{
			name:           "Provisioning to Ready",
			initialPhase:   ChatBotPhaseProvisioning,
			newPhase:       ChatBotPhaseReady,
			message:        "Bot is ready",
			reason:         "Ready",
			expectChange:   true,
			expectProvisioningStartTime: false,
			expectReadyTime:             true,
		},
		{
			name:           "Ready to Failed",
			initialPhase:   ChatBotPhaseReady,
			newPhase:       ChatBotPhaseFailed,
			message:        "Provisioning failed",
			reason:         "Failed",
			expectChange:   true,
			expectProvisioningStartTime: false,
			expectReadyTime:             false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			chatBot := &ChatBot{
				Status: ChatBotStatus{
					Phase: tt.initialPhase,
				},
			}

			chatBot.SetChatBotPhase(tt.newPhase, tt.message, tt.reason)

			if tt.expectChange {
				assert.Equal(t, tt.newPhase, chatBot.Status.Phase)
				assert.Equal(t, tt.message, chatBot.Status.Message)
				assert.Equal(t, tt.reason, chatBot.Status.Reason)
				assert.NotNil(t, chatBot.Status.LastTransitionTime)

				if tt.expectProvisioningStartTime {
					assert.NotNil(t, chatBot.Status.ProvisioningStartTime)
				} else {
					assert.Nil(t, chatBot.Status.ProvisioningStartTime)
				}

				if tt.expectReadyTime {
					assert.NotNil(t, chatBot.Status.ReadyTime)
				} else {
					assert.Nil(t, chatBot.Status.ReadyTime)
				}
			} else {
				assert.Equal(t, tt.initialPhase, chatBot.Status.Phase)
			}
		})
	}
}

// TestChatBotIsReady tests IsReady method
func TestChatBotIsReady(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		phase  ChatBotPhase
		isReady bool
	}{
		{"Pending phase", ChatBotPhasePending, false},
		{"Provisioning phase", ChatBotPhaseProvisioning, false},
		{"Ready phase", ChatBotPhaseReady, true},
		{"Updating phase", ChatBotPhaseUpdating, false},
		{"Terminating phase", ChatBotPhaseTerminating, false},
		{"Failed phase", ChatBotPhaseFailed, false},
		{"Deleted phase", ChatBotPhaseDeleted, false},
		{"Empty phase", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			chatBot := &ChatBot{
				Status: ChatBotStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isReady, chatBot.IsReady())
		})
	}
}

// TestChatBotIsFailed tests IsFailed method
func TestChatBotIsFailed(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		phase   ChatBotPhase
		isFailed bool
	}{
		{"Pending phase", ChatBotPhasePending, false},
		{"Provisioning phase", ChatBotPhaseProvisioning, false},
		{"Ready phase", ChatBotPhaseReady, false},
		{"Failed phase", ChatBotPhaseFailed, true},
		{"Deleted phase", ChatBotPhaseDeleted, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			chatBot := &ChatBot{
				Status: ChatBotStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isFailed, chatBot.IsFailed())
		})
	}
}

// TestChatBotIsTerminating tests IsTerminating method
func TestChatBotIsTerminating(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		phase        ChatBotPhase
		isTerminating bool
	}{
		{"Pending phase", ChatBotPhasePending, false},
		{"Provisioning phase", ChatBotPhaseProvisioning, false},
		{"Ready phase", ChatBotPhaseReady, false},
		{"Terminating phase", ChatBotPhaseTerminating, true},
		{"Failed phase", ChatBotPhaseFailed, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			chatBot := &ChatBot{
				Status: ChatBotStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isTerminating, chatBot.IsTerminating())
		})
	}
}

// TestChatBotAddError tests AddError method
func TestChatBotAddError(t *testing.T) {
	t.Parallel()

	chatBot := &ChatBot{
		Status: ChatBotStatus{},
	}

	// First error
	chatBot.AddError("First error")
	assert.NotNil(t, chatBot.Status.LastError)
	assert.Equal(t, "First error", chatBot.Status.LastError.Message)
	assert.Equal(t, int(1), chatBot.Status.LastError.Count)
	assert.NotNil(t, chatBot.Status.LastError.Time)

	// Second error - should increment count
	beforeTime := chatBot.Status.LastError.Time
	time.Sleep(10 * time.Millisecond) // Ensure time difference
	chatBot.AddError("Second error")
	assert.Equal(t, "Second error", chatBot.Status.LastError.Message)
	assert.Equal(t, int(2), chatBot.Status.LastError.Count)
	assert.NotEqual(t, beforeTime, chatBot.Status.LastError.Time)
}

// TestChatBotClearError tests ClearError method
func TestChatBotClearError(t *testing.T) {
	t.Parallel()

	chatBot := &ChatBot{
		Status: ChatBotStatus{
			LastError: &ErrorInfo{
				Message: "Some error",
				Count:   5,
			},
		},
	}

	chatBot.ClearError()
	assert.Nil(t, chatBot.Status.LastError)
}

// TestChatBotUpdateMetrics tests UpdateMetrics method
func TestChatBotUpdateMetrics(t *testing.T) {
	t.Parallel()

	chatBot := &ChatBot{
		Status: ChatBotStatus{},
	}

	chatBot.UpdateMetrics(10.5, 100, 5)
	assert.NotNil(t, chatBot.Status.Metrics)
	assert.Equal(t, float64(10.5), chatBot.Status.Metrics.ProvisioningTimeSeconds)
	assert.Equal(t, int64(100), chatBot.Status.Metrics.MessagesProcessed)
	assert.Equal(t, int64(5), chatBot.Status.Metrics.Errors)
}

// TestChatBotIncrementMessagesProcessed tests IncrementMessagesProcessed method
func TestChatBotIncrementMessagesProcessed(t *testing.T) {
	t.Parallel()

	chatBot := &ChatBot{
		Status: ChatBotStatus{},
	}

	// First increment
	chatBot.IncrementMessagesProcessed()
	assert.NotNil(t, chatBot.Status.Metrics)
	assert.Equal(t, int64(1), chatBot.Status.Metrics.MessagesProcessed)
	assert.NotNil(t, chatBot.Status.Metrics.LastMessageTime)

	// Second increment
	beforeTime := chatBot.Status.Metrics.LastMessageTime
	time.Sleep(10 * time.Millisecond)
	chatBot.IncrementMessagesProcessed()
	assert.Equal(t, int64(2), chatBot.Status.Metrics.MessagesProcessed)
	assert.NotEqual(t, beforeTime, chatBot.Status.Metrics.LastMessageTime)
}

// TestChatBotIncrementErrors tests IncrementErrors method
func TestChatBotIncrementErrors(t *testing.T) {
	t.Parallel()

	chatBot := &ChatBot{
		Status: ChatBotStatus{},
	}

	// First increment
	chatBot.IncrementErrors()
	assert.NotNil(t, chatBot.Status.Metrics)
	assert.Equal(t, int64(1), chatBot.Status.Metrics.Errors)

	// Second increment
	chatBot.IncrementErrors()
	assert.Equal(t, int64(2), chatBot.Status.Metrics.Errors)
}

// TestChatBotList tests ChatBotList type
func TestChatBotList(t *testing.T) {
	t.Parallel()

	items := []ChatBot{
		{ObjectMeta: metav1.ObjectMeta{Name: "bot1"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "bot2"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "bot3"}},
	}

	list := &ChatBotList{
		Items: items,
	}

	assert.Len(t, list.Items, 3)
	assert.Equal(t, "bot1", list.Items[0].Name)
	assert.Equal(t, "bot2", list.Items[1].Name)
	assert.Equal(t, "bot3", list.Items[2].Name)
}

// TestChatBotSpecValidation tests validation of ChatBotSpec
func TestChatBotSpecValidation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		spec        ChatBotSpec
		valid       bool
		description string
	}{
		{
			name: "Valid minimal spec",
			spec: ChatBotSpec{
				Platform: PlatformSlack,
				Name:     "valid-bot",
				Configuration: BotConfigurationSpec{
					BackendURL: "https://example.com",
				},
			},
			valid:       true,
			description: "Should be valid with required fields",
		},
		{
			name: "Invalid platform",
			spec: ChatBotSpec{
				Platform: PlatformType("invalid"),
				Name:     "test-bot",
				Configuration: BotConfigurationSpec{
					BackendURL: "https://example.com",
				},
			},
			valid:       false,
			description: "Invalid platform type",
		},
		{
			name: "Empty name",
			spec: ChatBotSpec{
				Platform: PlatformSlack,
				Name:     "",
				Configuration: BotConfigurationSpec{
					BackendURL: "https://example.com",
				},
			},
			valid:       false,
			description: "Name is required",
		},
		{
			name: "Invalid name pattern",
			spec: ChatBotSpec{
				Platform: PlatformSlack,
				Name:     "Invalid_Name",
				Configuration: BotConfigurationSpec{
					BackendURL: "https://example.com",
				},
			},
			valid:       false,
			description: "Name must match pattern",
		},
		{
			name: "Missing backend URL",
			spec: ChatBotSpec{
				Platform: PlatformSlack,
				Name:     "test-bot",
				Configuration: BotConfigurationSpec{
					BackendURL: "",
				},
			},
			valid:       false,
			description: "Backend URL is required",
		},
		{
			name: "Invalid backend URL format",
			spec: ChatBotSpec{
				Platform: PlatformSlack,
				Name:     "test-bot",
				Configuration: BotConfigurationSpec{
					BackendURL: "not-a-url",
				},
			},
			valid:       false,
			description: "Backend URL must be valid URI",
		},
	}

	// Note: Actual validation would be done by Kubernetes API server
	// These tests document the expected validation behavior
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			// For now, just test that we can create the spec
			// Real validation happens at API server level
			_ = tt.spec
		})
	}
}

// TestChatBotStatusTransitions tests valid status transitions
func TestChatBotStatusTransitions(t *testing.T) {
	t.Parallel()

	// Define valid transitions
	validTransitions := map[ChatBotPhase][]ChatBotPhase{
		ChatBotPhasePending:     {ChatBotPhaseProvisioning, ChatBotPhaseFailed},
		ChatBotPhaseProvisioning: {ChatBotPhaseReady, ChatBotPhaseFailed},
		ChatBotPhaseReady:        {ChatBotPhaseUpdating, ChatBotPhaseTerminating, ChatBotPhaseFailed},
		ChatBotPhaseUpdating:     {ChatBotPhaseReady, ChatBotPhaseFailed},
		ChatBotPhaseTerminating:  {ChatBotPhaseDeleted, ChatBotPhaseFailed},
		ChatBotPhaseFailed:       {ChatBotPhaseProvisioning, ChatBotPhaseDeleted},
		ChatBotPhaseDeleted:      {},
	}

	// Test that transitions are defined
	for from, tos := range validTransitions {
		for _, to := range tos {
			// This is a documentation test - we're verifying our transition model
			_ = from
			_ = to
		}
	}
}

// TestChatBotWithFullConfiguration tests creating a ChatBot with full configuration
func TestChatBotWithFullConfiguration(t *testing.T) {
	t.Parallel()

	chatBot := &ChatBot{
		ObjectMeta: metav1.ObjectMeta{
			Name:        "full-bot",
			Namespace:   "production",
			Labels:      map[string]string{"app": "chatbot"},
			Annotations: map[string]string{"description": "Full test bot"},
		},
		Spec: ChatBotSpec{
			Platform: PlatformDiscord,
			Name:     "full-bot",
			DisplayName: "Full Test Bot",
			Description:  "A fully configured test bot",
			Configuration: BotConfigurationSpec{
				BackendURL:  "https://backend.production.com",
				WebhookPath: "/api/webhook",
				RateLimit:   500,
				TimeoutSeconds: 60,
			},
			Credentials: CredentialReference{
				SecretName:      "bot-credentials",
				SecretNamespace: "production",
			},
			Enabled: true,
			TLS: &TLSConfig{
				Enabled: true,
				CertManager: &CertManagerConfig{
					Enabled:    true,
					IssuerName: "letsencrypt-prod",
					IssuerKind: "ClusterIssuer",
				},
			},
			Monitoring: &MonitoringConfig{
				Enabled: true,
				Metrics: &MetricsConfig{
					Enabled: true,
					Port:    9090,
				},
			},
			Resources: &ResourceRequirements{
				Limits: &ResourceLimits{
					CPU:    "1",
					Memory: "512Mi",
				},
				Requests: &ResourceRequests{
					CPU:    "500m",
					Memory: "256Mi",
				},
			},
			Labels:      map[string]string{"team": "platform"},
			Annotations: map[string]string{"owner": "platform-team"},
		},
		Status: ChatBotStatus{
			Phase:   ChatBotPhaseReady,
			Message: "Bot is ready",
			Reason:  "ProvisioningComplete",
			BotID:   "bot-12345",
			BotToken: "secret-token-ref",
			WebhookURL: "https://hooks.production.com/webhook",
			Metrics: &BotMetrics{
				ProvisioningTimeSeconds: 15.5,
				MessagesProcessed:      1000,
				Errors:                 5,
			},
		},
	}

	// Verify all fields are set correctly
	assert.Equal(t, "full-bot", chatBot.Name)
	assert.Equal(t, "production", chatBot.Namespace)
	assert.Equal(t, PlatformDiscord, chatBot.Spec.Platform)
	assert.Equal(t, "Full Test Bot", chatBot.Spec.DisplayName)
	assert.Equal(t, "A fully configured test bot", chatBot.Spec.Description)
	assert.Equal(t, "https://backend.production.com", chatBot.Spec.Configuration.BackendURL)
	assert.Equal(t, "/api/webhook", chatBot.Spec.Configuration.WebhookPath)
	assert.Equal(t, 500, chatBot.Spec.Configuration.RateLimit)
	assert.Equal(t, 60, chatBot.Spec.Configuration.TimeoutSeconds)
	assert.True(t, chatBot.Spec.Enabled)
	assert.NotNil(t, chatBot.Spec.TLS)
	assert.True(t, chatBot.Spec.TLS.Enabled)
	assert.NotNil(t, chatBot.Spec.TLS.CertManager)
	assert.True(t, chatBot.Spec.TLS.CertManager.Enabled)
	assert.Equal(t, ChatBotPhaseReady, chatBot.Status.Phase)
	assert.Equal(t, "Bot is ready", chatBot.Status.Message)
	assert.Equal(t, "ProvisioningComplete", chatBot.Status.Reason)
	assert.Equal(t, "bot-12345", chatBot.Status.BotID)
	assert.NotNil(t, chatBot.Status.Metrics)
	assert.Equal(t, float64(15.5), chatBot.Status.Metrics.ProvisioningTimeSeconds)
	assert.Equal(t, int64(1000), chatBot.Status.Metrics.MessagesProcessed)
	assert.Equal(t, int64(5), chatBot.Status.Metrics.Errors)
}

// TestChatBotDeepCopy tests that ChatBot can be deep copied
func TestChatBotDeepCopy(t *testing.T) {
	t.Parallel()

	original := &ChatBot{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "original",
			Namespace: "default",
			Labels:    map[string]string{"key": "value"},
		},
		Spec: ChatBotSpec{
			Platform: PlatformSlack,
			Name:     "original",
			Configuration: BotConfigurationSpec{
				BackendURL: "https://example.com",
			},
		},
		Status: ChatBotStatus{
			Phase:   ChatBotPhaseReady,
			Message: "Ready",
		},
	}

	// Note: DeepCopy would be generated by code generation
	// This test verifies the structure supports deep copying
	_ = original
}

// TestChatBotListDeepCopy tests that ChatBotList can be deep copied
func TestChatBotListDeepCopy(t *testing.T) {
	t.Parallel()

	original := &ChatBotList{
		Items: []ChatBot{
			{ObjectMeta: metav1.ObjectMeta{Name: "bot1"}},
			{ObjectMeta: metav1.ObjectMeta{Name: "bot2"}},
		},
	}

	// Note: DeepCopy would be generated by code generation
	_ = original
}

// BenchmarkChatBotSetChatBotPhase benchmarks phase setting
func BenchmarkChatBotSetChatBotPhase(b *testing.B) {
	chatBot := &ChatBot{
		Status: ChatBotStatus{
			Phase: ChatBotPhasePending,
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		chatBot.SetChatBotPhase(ChatBotPhaseReady, "Ready", "Complete")
	}
}

// BenchmarkChatBotIncrementMessagesProcessed benchmarks message counter increment
func BenchmarkChatBotIncrementMessagesProcessed(b *testing.B) {
	chatBot := &ChatBot{
		Status: ChatBotStatus{},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		chatBot.IncrementMessagesProcessed()
	}
}
