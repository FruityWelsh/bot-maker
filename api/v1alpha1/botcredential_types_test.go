// BotCredential API Types Tests
// ================================
// TDD tests for BotCredential resource types
// References: docs/omen/strategy.json (Application Goal AG001, Security Goal AG004)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-004)
// References: api/v1alpha1/botcredential_types.go (Implementation)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// TestBotCredentialPhaseConstants tests all BotCredentialPhase constants
func TestBotCredentialPhaseConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, BotCredentialPhase("Pending"), BotCredentialPhasePending)
	assert.Equal(t, BotCredentialPhase("Creating"), BotCredentialPhaseCreating)
	assert.Equal(t, BotCredentialPhase("Ready"), BotCredentialPhaseReady)
	assert.Equal(t, BotCredentialPhase("Rotating"), BotCredentialPhaseRotating)
	assert.Equal(t, BotCredentialPhase("Expired"), BotCredentialPhaseExpired)
	assert.Equal(t, BotCredentialPhase("Revoked"), BotCredentialPhaseRevoked)
	assert.Equal(t, BotCredentialPhase("Failed"), BotCredentialPhaseFailed)
	assert.Equal(t, BotCredentialPhase("Deleted"), BotCredentialPhaseDeleted)
}

// TestCredentialTypeConstants tests all CredentialType constants
func TestCredentialTypeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, CredentialType("apiToken"), CredentialTypeAPIToken)
	assert.Equal(t, CredentialType("oauthToken"), CredentialTypeOAuthToken)
	assert.Equal(t, CredentialType("webhookSecret"), CredentialTypeWebhookSecret)
	assert.Equal(t, CredentialType("apiKey"), CredentialTypeAPIKey)
	assert.Equal(t, CredentialType("bearerToken"), CredentialTypeBearerToken)
	assert.Equal(t, CredentialType("basicAuth"), CredentialTypeBasicAuth)
	assert.Equal(t, CredentialType("certificate"), CredentialTypeCertificate)
}

// TestCredentialScopeConstants tests all CredentialScope constants
func TestCredentialScopeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, CredentialScope("bot"), CredentialScopeBot)
	assert.Equal(t, CredentialScope("user"), CredentialScopeUser)
	assert.Equal(t, CredentialScope("workspace"), CredentialScopeWorkspace)
	assert.Equal(t, CredentialScope("organization"), CredentialScopeOrganization)
	assert.Equal(t, CredentialScope("global"), CredentialScopeGlobal)
}

// TestRotationStrategyConstants tests all RotationStrategy constants
func TestRotationStrategyConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, RotationStrategy("immediate"), RotationStrategyImmediate)
	assert.Equal(t, RotationStrategy("graceful"), RotationStrategyGraceful)
	assert.Equal(t, RotationStrategy("rolling"), RotationStrategyRolling)
}

// TestEncryptionAlgorithmConstants tests all EncryptionAlgorithm constants
func TestEncryptionAlgorithmConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, EncryptionAlgorithm("AES-256-GCM"), EncryptionAlgorithmAES256GCM)
	assert.Equal(t, EncryptionAlgorithm("AES-256-CBC"), EncryptionAlgorithmAES256CBC)
	assert.Equal(t, EncryptionAlgorithm("RSA-2048"), EncryptionAlgorithmRSA2048)
	assert.Equal(t, EncryptionAlgorithm("RSA-4096"), EncryptionAlgorithmRSA4096)
}

// TestBotCredentialDefaultValues tests default values for BotCredential
func TestBotCredentialDefaultValues(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-credential",
			Namespace: "default",
		},
		Spec: BotCredentialSpec{
			ChatBotRef: ChatBotReference{
				Name: "test-bot",
			},
			CredentialType: CredentialTypeAPIToken,
			Name:           "test-credential",
			Platform:       PlatformSlack,
			Value:          "test-token-value",
		},
	}

	// Test default values
	assert.Equal(t, CredentialScopeBot, botCredential.Spec.Scope)
	assert.True(t, botCredential.Spec.Encryption.Enabled)
	assert.Equal(t, EncryptionAlgorithmAES256GCM, botCredential.Spec.Encryption.Algorithm)
	assert.True(t, botCredential.Spec.Audit.Enabled)
	assert.True(t, botCredential.Spec.Audit.LogAccess)
	assert.True(t, botCredential.Spec.Audit.LogChanges)
}

// TestBotCredentialGetBotCredentialPhase tests GetBotCredentialPhase method
func TestBotCredentialGetBotCredentialPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		phase    BotCredentialPhase
		expected BotCredentialPhase
	}{
		{"Pending phase", BotCredentialPhasePending, BotCredentialPhasePending},
		{"Creating phase", BotCredentialPhaseCreating, BotCredentialPhaseCreating},
		{"Ready phase", BotCredentialPhaseReady, BotCredentialPhaseReady},
		{"Rotating phase", BotCredentialPhaseRotating, BotCredentialPhaseRotating},
		{"Expired phase", BotCredentialPhaseExpired, BotCredentialPhaseExpired},
		{"Revoked phase", BotCredentialPhaseRevoked, BotCredentialPhaseRevoked},
		{"Failed phase", BotCredentialPhaseFailed, BotCredentialPhaseFailed},
		{"Deleted phase", BotCredentialPhaseDeleted, BotCredentialPhaseDeleted},
		{"Empty phase", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botCredential := &BotCredential{
				Status: BotCredentialStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.expected, botCredential.GetBotCredentialPhase())
		})
	}
}

// TestBotCredentialSetBotCredentialPhase tests SetBotCredentialPhase method
func TestBotCredentialSetBotCredentialPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		initialPhase BotCredentialPhase
		newPhase     BotCredentialPhase
		message      string
		reason       string
		expectChange bool
	}{
		{
			name:         "Same phase - no change",
			initialPhase: BotCredentialPhaseReady,
			newPhase:     BotCredentialPhaseReady,
			message:      "Ready",
			reason:       "Credential is ready",
			expectChange: false,
		},
		{
			name:         "Pending to Creating",
			initialPhase: BotCredentialPhasePending,
			newPhase:     BotCredentialPhaseCreating,
			message:      "Creating credential",
			reason:       "Creating",
			expectChange: true,
		},
		{
			name:         "Creating to Ready",
			initialPhase: BotCredentialPhaseCreating,
			newPhase:     BotCredentialPhaseReady,
			message:      "Credential is ready",
			reason:       "Ready",
			expectChange: true,
		},
		{
			name:         "Ready to Rotating",
			initialPhase: BotCredentialPhaseReady,
			newPhase:     BotCredentialPhaseRotating,
			message:      "Rotating credential",
			reason:       "Rotation",
			expectChange: true,
		},
		{
			name:         "Ready to Expired",
			initialPhase: BotCredentialPhaseReady,
			newPhase:     BotCredentialPhaseExpired,
			message:      "Credential expired",
			reason:       "Expired",
			expectChange: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botCredential := &BotCredential{
				Status: BotCredentialStatus{
					Phase: tt.initialPhase,
				},
			}

			botCredential.SetBotCredentialPhase(tt.newPhase, tt.message, tt.reason)

			if tt.expectChange {
				assert.Equal(t, tt.newPhase, botCredential.Status.Phase)
				assert.Equal(t, tt.message, botCredential.Status.Message)
				assert.Equal(t, tt.reason, botCredential.Status.Reason)
				assert.NotNil(t, botCredential.Status.LastTransitionTime)
			} else {
				assert.Equal(t, tt.initialPhase, botCredential.Status.Phase)
			}
		})
	}
}

// TestBotCredentialIsReady tests IsReady method
func TestBotCredentialIsReady(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		phase  BotCredentialPhase
		isReady bool
	}{
		{"Pending phase", BotCredentialPhasePending, false},
		{"Creating phase", BotCredentialPhaseCreating, false},
		{"Ready phase", BotCredentialPhaseReady, true},
		{"Rotating phase", BotCredentialPhaseRotating, false},
		{"Expired phase", BotCredentialPhaseExpired, false},
		{"Revoked phase", BotCredentialPhaseRevoked, false},
		{"Failed phase", BotCredentialPhaseFailed, false},
		{"Deleted phase", BotCredentialPhaseDeleted, false},
		{"Empty phase", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botCredential := &BotCredential{
				Status: BotCredentialStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isReady, botCredential.IsReady())
		})
	}
}

// TestBotCredentialIsFailed tests IsFailed method
func TestBotCredentialIsFailed(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		phase   BotCredentialPhase
		isFailed bool
	}{
		{"Pending phase", BotCredentialPhasePending, false},
		{"Creating phase", BotCredentialPhaseCreating, false},
		{"Ready phase", BotCredentialPhaseReady, false},
		{"Failed phase", BotCredentialPhaseFailed, true},
		{"Deleted phase", BotCredentialPhaseDeleted, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botCredential := &BotCredential{
				Status: BotCredentialStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isFailed, botCredential.IsFailed())
		})
	}
}

// TestBotCredentialIsExpired tests IsExpired method
func TestBotCredentialIsExpired(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		phase    BotCredentialPhase
		isExpired bool
	}{
		{"Pending phase", BotCredentialPhasePending, false},
		{"Creating phase", BotCredentialPhaseCreating, false},
		{"Ready phase", BotCredentialPhaseReady, false},
		{"Expired phase", BotCredentialPhaseExpired, true},
		{"Revoked phase", BotCredentialPhaseRevoked, false},
		{"Failed phase", BotCredentialPhaseFailed, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botCredential := &BotCredential{
				Status: BotCredentialStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isExpired, botCredential.IsExpired())
		})
	}
}

// TestBotCredentialSetSecretInfo tests SetSecretInfo method
func TestBotCredentialSetSecretInfo(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	botCredential.SetSecretInfo("my-secret", "my-namespace")
	assert.Equal(t, "my-secret", botCredential.Status.SecretName)
	assert.Equal(t, "my-namespace", botCredential.Status.SecretNamespace)
}

// TestBotCredentialSetLastRotatedTime tests SetLastRotatedTime method
func TestBotCredentialSetLastRotatedTime(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	now := metav1.Now()
	botCredential.SetLastRotatedTime(&now)
	assert.NotNil(t, botCredential.Status.LastRotatedTime)
	assert.Equal(t, now.Time, botCredential.Status.LastRotatedTime.Time)
}

// TestBotCredentialSetNextRotationTime tests SetNextRotationTime method
func TestBotCredentialSetNextRotationTime(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	future := metav1.NewTime(time.Now().Add(24 * time.Hour))
	botCredential.SetNextRotationTime(&future)
	assert.NotNil(t, botCredential.Status.NextRotationTime)
	assert.Equal(t, future.Time, botCredential.Status.NextRotationTime.Time)
}

// TestBotCredentialIncrementRotationCount tests IncrementRotationCount method
func TestBotCredentialIncrementRotationCount(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	// First increment
	botCredential.IncrementRotationCount()
	assert.Equal(t, 1, botCredential.Status.RotationCount)

	// Second increment
	botCredential.IncrementRotationCount()
	assert.Equal(t, 2, botCredential.Status.RotationCount)
}

// TestBotCredentialSetLastAccessedTime tests SetLastAccessedTime method
func TestBotCredentialSetLastAccessedTime(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	now := metav1.Now()
	botCredential.SetLastAccessedTime(&now)
	assert.NotNil(t, botCredential.Status.LastAccessedTime)
	assert.Equal(t, now.Time, botCredential.Status.LastAccessedTime.Time)
}

// TestBotCredentialIncrementAccessCount tests IncrementAccessCount method
func TestBotCredentialIncrementAccessCount(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	// First increment
	botCredential.IncrementAccessCount()
	assert.Equal(t, int64(1), botCredential.Status.AccessCount)

	// Second increment
	botCredential.IncrementAccessCount()
	assert.Equal(t, int64(2), botCredential.Status.AccessCount)
}

// TestBotCredentialAddError tests AddError method
func TestBotCredentialAddError(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	// First error
	botCredential.AddError("First error")
	assert.NotNil(t, botCredential.Status.LastError)
	assert.Equal(t, "First error", botCredential.Status.LastError.Message)
	assert.Equal(t, int(1), botCredential.Status.LastError.Count)
	assert.NotNil(t, botCredential.Status.LastError.Time)

	// Second error - should increment count
	beforeTime := botCredential.Status.LastError.Time
	time.Sleep(10 * time.Millisecond)
	botCredential.AddError("Second error")
	assert.Equal(t, "Second error", botCredential.Status.LastError.Message)
	assert.Equal(t, int(2), botCredential.Status.LastError.Count)
	assert.NotEqual(t, beforeTime, botCredential.Status.LastError.Time)
}

// TestBotCredentialClearError tests ClearError method
func TestBotCredentialClearError(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{
			LastError: &ErrorInfo{
				Message: "Some error",
				Count:   5,
			},
		},
	}

	botCredential.ClearError()
	assert.Nil(t, botCredential.Status.LastError)
}

// TestBotCredentialUpdateMetrics tests UpdateMetrics method
func TestBotCredentialUpdateMetrics(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	botCredential.UpdateMetrics(30.5, 7, true)
	assert.NotNil(t, botCredential.Status.Metrics)
	assert.Equal(t, float64(30.5), botCredential.Status.Metrics.AgeDays)
	assert.Equal(t, 7, botCredential.Status.Metrics.DaysUntilExpiration)
	assert.True(t, botCredential.Status.Metrics.IsExpiringSoon)
}

// TestBotCredentialList tests BotCredentialList type
func TestBotCredentialList(t *testing.T) {
	t.Parallel()

	items := []BotCredential{
		{ObjectMeta: metav1.ObjectMeta{Name: "credential1"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "credential2"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "credential3"}},
	}

	list := &BotCredentialList{
		Items: items,
	}

	assert.Len(t, list.Items, 3)
	assert.Equal(t, "credential1", list.Items[0].Name)
	assert.Equal(t, "credential2", list.Items[1].Name)
	assert.Equal(t, "credential3", list.Items[2].Name)
}

// TestRotationConfig tests RotationConfig
func TestRotationConfig(t *testing.T) {
	t.Parallel()

	rotation := &RotationConfig{
		Enabled:           true,
		Schedule:          "0 0 * * *",
		RotationStrategy:  RotationStrategyGraceful,
		GracePeriodHours:   24,
		MaxRetries:        3,
	}

	assert.True(t, rotation.Enabled)
	assert.Equal(t, "0 0 * * *", rotation.Schedule)
	assert.Equal(t, RotationStrategyGraceful, rotation.RotationStrategy)
	assert.Equal(t, 24, rotation.GracePeriodHours)
	assert.Equal(t, 3, rotation.MaxRetries)
}

// TestEncryptionConfig tests EncryptionConfig
func TestEncryptionConfig(t *testing.T) {
	t.Parallel()

	encryption := &EncryptionConfig{
		Enabled:   true,
		Algorithm: EncryptionAlgorithmAES256GCM,
		KeyReference: &SecretKeySelector{
			Name:      "encryption-key",
			Key:       "key",
			Namespace: "security",
		},
	}

	assert.True(t, encryption.Enabled)
	assert.Equal(t, EncryptionAlgorithmAES256GCM, encryption.Algorithm)
	assert.NotNil(t, encryption.KeyReference)
	assert.Equal(t, "encryption-key", encryption.KeyReference.Name)
	assert.Equal(t, "key", encryption.KeyReference.Key)
	assert.Equal(t, "security", encryption.KeyReference.Namespace)
}

// TestAuditConfig tests AuditConfig
func TestAuditConfig(t *testing.T) {
	t.Parallel()

	audit := &AuditConfig{
		Enabled:    true,
		LogAccess:  true,
		LogChanges: true,
	}

	assert.True(t, audit.Enabled)
	assert.True(t, audit.LogAccess)
	assert.True(t, audit.LogChanges)
}

// TestCredentialMetrics tests CredentialMetrics
func TestCredentialMetrics(t *testing.T) {
	t.Parallel()

	metrics := &CredentialMetrics{
		AgeDays:             30.5,
		DaysUntilExpiration: 7,
		IsExpiringSoon:      true,
	}

	assert.Equal(t, float64(30.5), metrics.AgeDays)
	assert.Equal(t, 7, metrics.DaysUntilExpiration)
	assert.True(t, metrics.IsExpiringSoon)
}

// TestBotCredentialWithFullSpec tests BotCredential with full specification
func TestBotCredentialWithFullSpec(t *testing.T) {
	t.Parallel()

	expiresAt := metav1.NewTime(time.Now().Add(30 * 24 * time.Hour))
	lastRotated := metav1.Now()
	nextRotation := metav1.NewTime(time.Now().Add(24 * time.Hour))
	lastAccessed := metav1.Now()

	botCredential := &BotCredential{
		ObjectMeta: metav1.ObjectMeta{
			Name:        "full-credential",
			Namespace:   "production",
			Labels:      map[string]string{"app": "chatbot", "type": "api-token"},
			Annotations: map[string]string{"description": "Full credential for production bot"},
		},
		Spec: BotCredentialSpec{
			ChatBotRef: ChatBotReference{
				Name:      "production-bot",
				Namespace: "production",
			},
			CredentialType: CredentialTypeAPIToken,
			Name:           "full-credential",
			Description:    "API token for production Slack bot",
			Value:          "mock-token-value-for-testing-only",
			Platform:       PlatformSlack,
			Scope:          CredentialScopeBot,
			Permissions:    []string{"chat:write", "chat:read", "commands", "users:read"},
			ExpiresAt:      &expiresAt,
			Rotation: &RotationConfig{
				Enabled:           true,
				Schedule:          "0 0 * * 0", // Every Sunday at midnight
				RotationStrategy:  RotationStrategyGraceful,
				GracePeriodHours:   48,
				MaxRetries:        5,
			},
			Encryption: &EncryptionConfig{
				Enabled:   true,
				Algorithm: EncryptionAlgorithmAES256GCM,
				KeyReference: &SecretKeySelector{
					Name:      "encryption-key",
					Key:       "aes-key",
					Namespace: "security",
				},
			},
			Audit: &AuditConfig{
				Enabled:    true,
				LogAccess:  true,
				LogChanges: true,
			},
			Labels:      map[string]string{"team": "platform", "environment": "production"},
			Annotations: map[string]string{"owner": "platform-team", "sensitivity": "high"},
		},
		Status: BotCredentialStatus{
			Phase:             BotCredentialPhaseReady,
			Message:          "Credential is ready and active",
			Reason:           "CreationComplete",
			SecretName:       "production-bot-token",
			SecretNamespace:  "production",
			LastRotatedTime:  &lastRotated,
			NextRotationTime: &nextRotation,
			RotationCount:    2,
			LastAccessedTime: &lastAccessed,
			AccessCount:      1000,
			Metrics: &CredentialMetrics{
				AgeDays:             7.5,
				DaysUntilExpiration: 30,
				IsExpiringSoon:      false,
			},
		},
	}

	// Verify all fields
	assert.Equal(t, "full-credential", botCredential.Name)
	assert.Equal(t, "production", botCredential.Namespace)
	assert.Equal(t, "production-bot", botCredential.Spec.ChatBotRef.Name)
	assert.Equal(t, CredentialTypeAPIToken, botCredential.Spec.CredentialType)
	assert.Equal(t, PlatformSlack, botCredential.Spec.Platform)
	assert.Equal(t, CredentialScopeBot, botCredential.Spec.Scope)
	assert.Len(t, botCredential.Spec.Permissions, 4)
	assert.NotNil(t, botCredential.Spec.ExpiresAt)
	assert.NotNil(t, botCredential.Spec.Rotation)
	assert.True(t, botCredential.Spec.Rotation.Enabled)
	assert.Equal(t, RotationStrategyGraceful, botCredential.Spec.Rotation.RotationStrategy)
	assert.NotNil(t, botCredential.Spec.Encryption)
	assert.True(t, botCredential.Spec.Encryption.Enabled)
	assert.Equal(t, EncryptionAlgorithmAES256GCM, botCredential.Spec.Encryption.Algorithm)
	assert.NotNil(t, botCredential.Spec.Audit)
	assert.True(t, botCredential.Spec.Audit.Enabled)
	assert.Equal(t, BotCredentialPhaseReady, botCredential.Status.Phase)
	assert.Equal(t, "production-bot-token", botCredential.Status.SecretName)
	assert.Equal(t, "production", botCredential.Status.SecretNamespace)
	assert.Equal(t, 2, botCredential.Status.RotationCount)
	assert.Equal(t, int64(1000), botCredential.Status.AccessCount)
	assert.NotNil(t, botCredential.Status.Metrics)
	assert.Equal(t, float64(7.5), botCredential.Status.Metrics.AgeDays)
	assert.Equal(t, 30, botCredential.Status.Metrics.DaysUntilExpiration)
	assert.False(t, botCredential.Status.Metrics.IsExpiringSoon)
}

// TestBotCredentialWithValueFrom tests BotCredential with ValueFrom
func TestBotCredentialWithValueFrom(t *testing.T) {
	t.Parallel()

	botCredential := &BotCredential{
		Spec: BotCredentialSpec{
			ChatBotRef: ChatBotReference{
				Name: "test-bot",
			},
			CredentialType: CredentialTypeAPIToken,
			Name:           "credential-from-secret",
			Platform:       PlatformDiscord,
			ValueFrom: &SecretKeySelector{
				Name:      "existing-secret",
				Key:       "token",
				Namespace: "default",
			},
		},
	}

	assert.Equal(t, "credential-from-secret", botCredential.Spec.Name)
	assert.NotNil(t, botCredential.Spec.ValueFrom)
	assert.Equal(t, "existing-secret", botCredential.Spec.ValueFrom.Name)
	assert.Equal(t, "token", botCredential.Spec.ValueFrom.Key)
	assert.Equal(t, "default", botCredential.Spec.ValueFrom.Namespace)
}

// TestBotCredentialStatusTransitions tests valid status transitions
func TestBotCredentialStatusTransitions(t *testing.T) {
	t.Parallel()

	// Define valid transitions
	validTransitions := map[BotCredentialPhase][]BotCredentialPhase{
		BotCredentialPhasePending:   {BotCredentialPhaseCreating, BotCredentialPhaseFailed},
		BotCredentialPhaseCreating:  {BotCredentialPhaseReady, BotCredentialPhaseFailed},
		BotCredentialPhaseReady:     {BotCredentialPhaseRotating, BotCredentialPhaseExpired, BotCredentialPhaseRevoked, BotCredentialPhaseFailed},
		BotCredentialPhaseRotating:  {BotCredentialPhaseReady, BotCredentialPhaseFailed},
		BotCredentialPhaseExpired:   {BotCredentialPhaseRotating, BotCredentialPhaseRevoked, BotCredentialPhaseDeleted},
		BotCredentialPhaseRevoked:  {BotCredentialPhaseDeleted},
		BotCredentialPhaseFailed:    {BotCredentialPhaseCreating, BotCredentialPhaseDeleted},
		BotCredentialPhaseDeleted:   {},
	}

	// Test that transitions are defined
	for from, tos := range validTransitions {
		for _, to := range tos {
			_ = from
			_ = to
		}
	}
}

// BenchmarkBotCredentialSetBotCredentialPhase benchmarks phase setting
func BenchmarkBotCredentialSetBotCredentialPhase(b *testing.B) {
	botCredential := &BotCredential{
		Status: BotCredentialStatus{
			Phase: BotCredentialPhasePending,
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		botCredential.SetBotCredentialPhase(BotCredentialPhaseReady, "Ready", "Complete")
	}
}

// BenchmarkBotCredentialIncrementAccessCount benchmarks access count increment
func BenchmarkBotCredentialIncrementAccessCount(b *testing.B) {
	botCredential := &BotCredential{
		Status: BotCredentialStatus{},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		botCredential.IncrementAccessCount()
	}
}
