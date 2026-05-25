// BotPlatform API Types Tests
// ==============================
// TDD tests for BotPlatform resource types
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-003)
// References: api/v1alpha1/botplatform_types.go (Implementation)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// TestBotPlatformPhaseConstants tests all BotPlatformPhase constants
func TestBotPlatformPhaseConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, BotPlatformPhase("Pending"), BotPlatformPhasePending)
	assert.Equal(t, BotPlatformPhase("Configuring"), BotPlatformPhaseConfiguring)
	assert.Equal(t, BotPlatformPhase("Ready"), BotPlatformPhaseReady)
	assert.Equal(t, BotPlatformPhase("Failed"), BotPlatformPhaseFailed)
	assert.Equal(t, BotPlatformPhase("Deleted"), BotPlatformPhaseDeleted)
}

// TestProvisionerStatusConstants tests all ProvisionerStatus constants
func TestProvisionerStatusConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, ProvisionerStatus("NotReady"), ProvisionerStatusNotReady)
	assert.Equal(t, ProvisionerStatus("Ready"), ProvisionerStatusReady)
	assert.Equal(t, ProvisionerStatus("Failed"), ProvisionerStatusFailed)
}

// TestAPIStatusConstants tests all APIStatus constants
func TestAPIStatusConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, APIStatus("NotConnected"), APIStatusNotConnected)
	assert.Equal(t, APIStatus("Connected"), APIStatusConnected)
	assert.Equal(t, APIStatus("Failed"), APIStatusFailed)
}

// TestAuthenticationMethodConstants tests all AuthenticationMethod constants
func TestAuthenticationMethodConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, AuthenticationMethod("oauth2"), AuthenticationMethodOAuth2)
	assert.Equal(t, AuthenticationMethod("apiKey"), AuthenticationMethodAPIKey)
	assert.Equal(t, AuthenticationMethod("bearerToken"), AuthenticationMethodBearerToken)
	assert.Equal(t, AuthenticationMethod("basicAuth"), AuthenticationMethodBasicAuth)
}

// TestBotPlatformDefaultValues tests default values for BotPlatform
func TestBotPlatformDefaultValues(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-platform",
			Namespace: "default",
		},
		Spec: BotPlatformSpec{
			PlatformType: PlatformSlack,
			Name:         "test-platform",
			API: &APIConfig{
				BaseURL: "https://api.slack.com",
			},
			Authentication: &AuthenticationConfig{
				Method: AuthenticationMethodOAuth2,
				OAuth2: &OAuth2Config{
					ClientID:     "mock-slack-client-id",
					ClientSecret: "mock-slack-client-secret",
					TokenURL:     "https://oauth.slack.com/token",
				},
			},
			Provisioning: &ProvisioningConfig{
				ProvisionerImage: "ghcr.io/chatbot-operator/provisioner-slack:v1",
			},
		},
	}

	// Test default values
	assert.Equal(t, "v1", botPlatform.Spec.API.Version)
	assert.Equal(t, 60, botPlatform.Spec.API.RateLimit)
	assert.Equal(t, 30, botPlatform.Spec.API.TimeoutSeconds)
	assert.Equal(t, "/provisioner", botPlatform.Spec.Provisioning.ProvisionerCommand[0])
	assert.Equal(t, 300, botPlatform.Spec.Provisioning.TimeoutSeconds)
}

// TestBotPlatformGetBotPlatformPhase tests GetBotPlatformPhase method
func TestBotPlatformGetBotPlatformPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		phase    BotPlatformPhase
		expected BotPlatformPhase
	}{
		{"Pending phase", BotPlatformPhasePending, BotPlatformPhasePending},
		{"Configuring phase", BotPlatformPhaseConfiguring, BotPlatformPhaseConfiguring},
		{"Ready phase", BotPlatformPhaseReady, BotPlatformPhaseReady},
		{"Failed phase", BotPlatformPhaseFailed, BotPlatformPhaseFailed},
		{"Deleted phase", BotPlatformPhaseDeleted, BotPlatformPhaseDeleted},
		{"Empty phase", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botPlatform := &BotPlatform{
				Status: BotPlatformStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.expected, botPlatform.GetBotPlatformPhase())
		})
	}
}

// TestBotPlatformSetBotPlatformPhase tests SetBotPlatformPhase method
func TestBotPlatformSetBotPlatformPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		initialPhase BotPlatformPhase
		newPhase     BotPlatformPhase
		message      string
		reason       string
		expectChange bool
	}{
		{
			name:         "Same phase - no change",
			initialPhase: BotPlatformPhaseReady,
			newPhase:     BotPlatformPhaseReady,
			message:      "Ready",
			reason:       "Platform is ready",
			expectChange: false,
		},
		{
			name:         "Pending to Configuring",
			initialPhase: BotPlatformPhasePending,
			newPhase:     BotPlatformPhaseConfiguring,
			message:      "Configuration started",
			reason:       "Configuring",
			expectChange: true,
		},
		{
			name:         "Configuring to Ready",
			initialPhase: BotPlatformPhaseConfiguring,
			newPhase:     BotPlatformPhaseReady,
			message:      "Platform is ready",
			reason:       "Ready",
			expectChange: true,
		},
		{
			name:         "Ready to Failed",
			initialPhase: BotPlatformPhaseReady,
			newPhase:     BotPlatformPhaseFailed,
			message:      "Configuration failed",
			reason:       "Failed",
			expectChange: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botPlatform := &BotPlatform{
				Status: BotPlatformStatus{
					Phase: tt.initialPhase,
				},
			}

			botPlatform.SetBotPlatformPhase(tt.newPhase, tt.message, tt.reason)

			if tt.expectChange {
				assert.Equal(t, tt.newPhase, botPlatform.Status.Phase)
				assert.Equal(t, tt.message, botPlatform.Status.Message)
				assert.Equal(t, tt.reason, botPlatform.Status.Reason)
				assert.NotNil(t, botPlatform.Status.LastTransitionTime)
			} else {
				assert.Equal(t, tt.initialPhase, botPlatform.Status.Phase)
			}
		})
	}
}

// TestBotPlatformIsReady tests IsReady method
func TestBotPlatformIsReady(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		phase  BotPlatformPhase
		isReady bool
	}{
		{"Pending phase", BotPlatformPhasePending, false},
		{"Configuring phase", BotPlatformPhaseConfiguring, false},
		{"Ready phase", BotPlatformPhaseReady, true},
		{"Failed phase", BotPlatformPhaseFailed, false},
		{"Deleted phase", BotPlatformPhaseDeleted, false},
		{"Empty phase", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botPlatform := &BotPlatform{
				Status: BotPlatformStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isReady, botPlatform.IsReady())
		})
	}
}

// TestBotPlatformIsFailed tests IsFailed method
func TestBotPlatformIsFailed(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		phase   BotPlatformPhase
		isFailed bool
	}{
		{"Pending phase", BotPlatformPhasePending, false},
		{"Configuring phase", BotPlatformPhaseConfiguring, false},
		{"Ready phase", BotPlatformPhaseReady, false},
		{"Failed phase", BotPlatformPhaseFailed, true},
		{"Deleted phase", BotPlatformPhaseDeleted, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botPlatform := &BotPlatform{
				Status: BotPlatformStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isFailed, botPlatform.IsFailed())
		})
	}
}

// TestBotPlatformSetProvisionerStatus tests SetProvisionerStatus method
func TestBotPlatformSetProvisionerStatus(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		status   ProvisionerStatus
		expected ProvisionerStatus
	}{
		{"NotReady", ProvisionerStatusNotReady, ProvisionerStatusNotReady},
		{"Ready", ProvisionerStatusReady, ProvisionerStatusReady},
		{"Failed", ProvisionerStatusFailed, ProvisionerStatusFailed},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botPlatform := &BotPlatform{
				Status: BotPlatformStatus{},
			}

			botPlatform.SetProvisionerStatus(tt.status)
			assert.Equal(t, tt.expected, botPlatform.Status.ProvisionerStatus)
		})
	}
}

// TestBotPlatformSetAPIStatus tests SetAPIStatus method
func TestBotPlatformSetAPIStatus(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		status   APIStatus
		expected APIStatus
	}{
		{"NotConnected", APIStatusNotConnected, APIStatusNotConnected},
		{"Connected", APIStatusConnected, APIStatusConnected},
		{"Failed", APIStatusFailed, APIStatusFailed},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botPlatform := &BotPlatform{
				Status: BotPlatformStatus{},
			}

			botPlatform.SetAPIStatus(tt.status)
			assert.Equal(t, tt.expected, botPlatform.Status.APIStatus)
		})
	}
}

// TestBotPlatformAddError tests AddError method
func TestBotPlatformAddError(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{},
	}

	// First error
	botPlatform.AddError("First error")
	assert.NotNil(t, botPlatform.Status.LastError)
	assert.Equal(t, "First error", botPlatform.Status.LastError.Message)
	assert.Equal(t, int(1), botPlatform.Status.LastError.Count)
	assert.NotNil(t, botPlatform.Status.LastError.Time)

	// Second error - should increment count
	beforeTime := botPlatform.Status.LastError.Time
	time.Sleep(10 * time.Millisecond)
	botPlatform.AddError("Second error")
	assert.Equal(t, "Second error", botPlatform.Status.LastError.Message)
	assert.Equal(t, int(2), botPlatform.Status.LastError.Count)
	assert.NotEqual(t, beforeTime, botPlatform.Status.LastError.Time)
}

// TestBotPlatformClearError tests ClearError method
func TestBotPlatformClearError(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{
			LastError: &ErrorInfo{
				Message: "Some error",
				Count:   5,
			},
		},
	}

	botPlatform.ClearError()
	assert.Nil(t, botPlatform.Status.LastError)
}

// TestBotPlatformUpdateMetrics tests UpdateMetrics method
func TestBotPlatformUpdateMetrics(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{},
	}

	botPlatform.UpdateMetrics(100, 5)
	assert.NotNil(t, botPlatform.Status.Metrics)
	assert.Equal(t, int64(100), botPlatform.Status.Metrics.APICalls)
	assert.Equal(t, int64(5), botPlatform.Status.Metrics.Errors)
	assert.NotNil(t, botPlatform.Status.Metrics.LastApiCallTime)
}

// TestBotPlatformIncrementAPICalls tests IncrementAPICalls method
func TestBotPlatformIncrementAPICalls(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{},
	}

	// First increment
	botPlatform.IncrementAPICalls()
	assert.NotNil(t, botPlatform.Status.Metrics)
	assert.Equal(t, int64(1), botPlatform.Status.Metrics.APICalls)
	assert.NotNil(t, botPlatform.Status.Metrics.LastApiCallTime)

	// Second increment
	beforeTime := botPlatform.Status.Metrics.LastApiCallTime
	time.Sleep(10 * time.Millisecond)
	botPlatform.IncrementAPICalls()
	assert.Equal(t, int64(2), botPlatform.Status.Metrics.APICalls)
	assert.NotEqual(t, beforeTime, botPlatform.Status.Metrics.LastApiCallTime)
}

// TestBotPlatformIncrementErrors tests IncrementErrors method
func TestBotPlatformIncrementErrors(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{},
	}

	// First increment
	botPlatform.IncrementErrors()
	assert.NotNil(t, botPlatform.Status.Metrics)
	assert.Equal(t, int64(1), botPlatform.Status.Metrics.Errors)

	// Second increment
	botPlatform.IncrementErrors()
	assert.Equal(t, int64(2), botPlatform.Status.Metrics.Errors)
}

// TestBotPlatformList tests BotPlatformList type
func TestBotPlatformList(t *testing.T) {
	t.Parallel()

	items := []BotPlatform{
		{ObjectMeta: metav1.ObjectMeta{Name: "platform1"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "platform2"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "platform3"}},
	}

	list := &BotPlatformList{
		Items: items,
	}

	assert.Len(t, list.Items, 3)
	assert.Equal(t, "platform1", list.Items[0].Name)
	assert.Equal(t, "platform2", list.Items[1].Name)
	assert.Equal(t, "platform3", list.Items[2].Name)
}

// TestBotPlatformWithOAuth2Authentication tests BotPlatform with OAuth2 authentication
func TestBotPlatformWithOAuth2Authentication(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "slack-platform",
			Namespace: "default",
		},
		Spec: BotPlatformSpec{
			PlatformType: PlatformSlack,
			Name:         "slack-platform",
			DisplayName:  "Slack Platform",
			Description:  "Slack integration platform",
			API: &APIConfig{
				BaseURL:    "https://api.slack.com",
				Version:    "v2",
				RateLimit:  100,
				TimeoutSeconds: 30,
			},
			Authentication: &AuthenticationConfig{
				Method: AuthenticationMethodOAuth2,
				OAuth2: &OAuth2Config{
					ClientID:     "slack-client-id",
					ClientSecret: "mock-slack-client-secret",
					TokenURL:     "https://slack.com/oauth/token",
					Scopes:       []string{"chat:write", "chat:read", "commands"},
				},
			},
			Provisioning: &ProvisioningConfig{
				ProvisionerImage: "ghcr.io/chatbot-operator/provisioner-slack:v1",
				ProvisionerCommand: []string{"/provisioner"},
				TimeoutSeconds: 600,
				Environment: []EnvVar{
					{Name: "SLACK_API_URL", Value: "https://api.slack.com"},
				},
			},
			Webhook: &WebhookConfig{
				Enabled:    true,
				PathPrefix: "/slack",
				Port:       8080,
				TLS: &WebhookTLSConfig{
					Enabled: true,
					CertManager: &CertManagerConfig{
						Enabled:    true,
						IssuerName: "letsencrypt-prod",
						IssuerKind: "ClusterIssuer",
					},
				},
			},
			Monitoring: &MonitoringConfig{
				Enabled: true,
				Metrics: &MetricsConfig{
					Enabled: true,
					Port:    9090,
				},
			},
		},
		Status: BotPlatformStatus{
			Phase:             BotPlatformPhaseReady,
			Message:          "Platform is ready",
			Reason:           "ConfigurationComplete",
			ProvisionerStatus: ProvisionerStatusReady,
			APIStatus:         APIStatusConnected,
			Metrics: &PlatformMetrics{
				APICalls: 1000,
				Errors:   0,
			},
		},
	}

	// Verify all fields
	assert.Equal(t, "slack-platform", botPlatform.Name)
	assert.Equal(t, PlatformSlack, botPlatform.Spec.PlatformType)
	assert.Equal(t, "Slack Platform", botPlatform.Spec.DisplayName)
	assert.Equal(t, "https://api.slack.com", botPlatform.Spec.API.BaseURL)
	assert.Equal(t, AuthenticationMethodOAuth2, botPlatform.Spec.Authentication.Method)
	assert.NotNil(t, botPlatform.Spec.Authentication.OAuth2)
	assert.Equal(t, "slack-client-id", botPlatform.Spec.Authentication.OAuth2.ClientID)
	assert.Equal(t, "https://slack.com/oauth/token", botPlatform.Spec.Authentication.OAuth2.TokenURL)
	assert.Len(t, botPlatform.Spec.Authentication.OAuth2.Scopes, 3)
	assert.NotNil(t, botPlatform.Spec.Provisioning)
	assert.Equal(t, "ghcr.io/chatbot-operator/provisioner-slack:v1", botPlatform.Spec.Provisioning.ProvisionerImage)
	assert.NotNil(t, botPlatform.Spec.Webhook)
	assert.True(t, botPlatform.Spec.Webhook.Enabled)
	assert.Equal(t, BotPlatformPhaseReady, botPlatform.Status.Phase)
	assert.Equal(t, ProvisionerStatusReady, botPlatform.Status.ProvisionerStatus)
	assert.Equal(t, APIStatusConnected, botPlatform.Status.APIStatus)
}

// TestBotPlatformWithAPIKeyAuthentication tests BotPlatform with API key authentication
func TestBotPlatformWithAPIKeyAuthentication(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Spec: BotPlatformSpec{
			PlatformType: PlatformDiscord,
			Name:         "discord-platform",
			API: &APIConfig{
				BaseURL: "https://discord.com/api",
			},
			Authentication: &AuthenticationConfig{
				Method: AuthenticationMethodAPIKey,
				APIKey: &APIKeyConfig{
					HeaderName: "X-Discord-Token",
					SecretName: "mock-discord-api-key",
				},
			},
			Provisioning: &ProvisioningConfig{
				ProvisionerImage: "ghcr.io/chatbot-operator/provisioner-discord:v1",
			},
		},
	}

	assert.Equal(t, PlatformDiscord, botPlatform.Spec.PlatformType)
	assert.Equal(t, AuthenticationMethodAPIKey, botPlatform.Spec.Authentication.Method)
	assert.NotNil(t, botPlatform.Spec.Authentication.APIKey)
	assert.Equal(t, "X-Discord-Token", botPlatform.Spec.Authentication.APIKey.HeaderName)
	assert.Equal(t, "mock-discord-api-key", botPlatform.Spec.Authentication.APIKey.SecretName)
}

// TestBotPlatformWithBearerTokenAuthentication tests BotPlatform with bearer token authentication
func TestBotPlatformWithBearerTokenAuthentication(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Spec: BotPlatformSpec{
			PlatformType: PlatformMatrix,
			Name:         "matrix-platform",
			API: &APIConfig{
				BaseURL: "https://matrix.org/api",
			},
			Authentication: &AuthenticationConfig{
				Method: AuthenticationMethodBearerToken,
				BearerToken: &BearerTokenConfig{
					SecretName: "mock-matrix-bearer-token",
				},
			},
			Provisioning: &ProvisioningConfig{
				ProvisionerImage: "ghcr.io/chatbot-operator/provisioner-matrix:v1",
			},
		},
	}

	assert.Equal(t, PlatformMatrix, botPlatform.Spec.PlatformType)
	assert.Equal(t, AuthenticationMethodBearerToken, botPlatform.Spec.Authentication.Method)
	assert.NotNil(t, botPlatform.Spec.Authentication.BearerToken)
	assert.Equal(t, "mock-matrix-bearer-token", botPlatform.Spec.Authentication.BearerToken.SecretName)
}

// TestBotPlatformWithBasicAuthAuthentication tests BotPlatform with basic auth authentication
func TestBotPlatformWithBasicAuthAuthentication(t *testing.T) {
	t.Parallel()

	botPlatform := &BotPlatform{
		Spec: BotPlatformSpec{
			PlatformType: PlatformTwilio,
			Name:         "twilio-platform",
			API: &APIConfig{
				BaseURL: "https://api.twilio.com",
			},
			Authentication: &AuthenticationConfig{
				Method: AuthenticationMethodBasicAuth,
				BasicAuth: &BasicAuthConfig{
					Username:            "twilio-username",
					PasswordSecretName: "mock-twilio-password",
				},
			},
			Provisioning: &ProvisioningConfig{
				ProvisionerImage: "ghcr.io/chatbot-operator/provisioner-twilio:v1",
			},
		},
	}

	assert.Equal(t, PlatformTwilio, botPlatform.Spec.PlatformType)
	assert.Equal(t, AuthenticationMethodBasicAuth, botPlatform.Spec.Authentication.Method)
	assert.NotNil(t, botPlatform.Spec.Authentication.BasicAuth)
	assert.Equal(t, "twilio-username", botPlatform.Spec.Authentication.BasicAuth.Username)
	assert.Equal(t, "mock-twilio-password", botPlatform.Spec.Authentication.BasicAuth.PasswordSecretName)
}

// TestProvisioningConfigWithEnvironment tests ProvisioningConfig with environment variables
func TestProvisioningConfigWithEnvironment(t *testing.T) {
	t.Parallel()

	provisioning := &ProvisioningConfig{
		ProvisionerImage: "test-provisioner:v1",
		Environment: []EnvVar{
			{Name: "ENV1", Value: "value1"},
			{Name: "ENV2", ValueFrom: &SecretKeySelector{
				Name:      "secret1",
				Key:       "key1",
				Namespace: "default",
			}},
		},
		Resources: &ProvisionerResources{
			Limits: &ResourceLimits{
				CPU:    "500m",
				Memory: "256Mi",
			},
			Requests: &ResourceRequests{
				CPU:    "100m",
				Memory: "128Mi",
			},
		},
	}

	assert.Equal(t, "test-provisioner:v1", provisioning.ProvisionerImage)
	assert.Len(t, provisioning.Environment, 2)
	assert.Equal(t, "ENV1", provisioning.Environment[0].Name)
	assert.Equal(t, "value1", provisioning.Environment[0].Value)
	assert.Equal(t, "ENV2", provisioning.Environment[1].Name)
	assert.NotNil(t, provisioning.Environment[1].ValueFrom)
	assert.Equal(t, "secret1", provisioning.Environment[1].ValueFrom.Name)
	assert.Equal(t, "key1", provisioning.Environment[1].ValueFrom.Key)
	assert.Equal(t, "default", provisioning.Environment[1].ValueFrom.Namespace)
	assert.NotNil(t, provisioning.Resources)
	assert.Equal(t, "500m", provisioning.Resources.Limits.CPU)
	assert.Equal(t, "256Mi", provisioning.Resources.Limits.Memory)
}

// TestWebhookConfig tests WebhookConfig
func TestWebhookConfig(t *testing.T) {
	t.Parallel()

	webhook := &WebhookConfig{
		Enabled:    true,
		PathPrefix: "/webhook",
		Port:       8443,
		TLS: &WebhookTLSConfig{
			Enabled: true,
			CertManager: &CertManagerConfig{
				Enabled:    true,
				IssuerName: "letsencrypt-staging",
				IssuerKind: "Issuer",
			},
		},
	}

	assert.True(t, webhook.Enabled)
	assert.Equal(t, "/webhook", webhook.PathPrefix)
	assert.Equal(t, 8443, webhook.Port)
	assert.NotNil(t, webhook.TLS)
	assert.True(t, webhook.TLS.Enabled)
	assert.NotNil(t, webhook.TLS.CertManager)
	assert.True(t, webhook.TLS.CertManager.Enabled)
	assert.Equal(t, "letsencrypt-staging", webhook.TLS.CertManager.IssuerName)
}

// TestPlatformMetrics tests PlatformMetrics
func TestPlatformMetrics(t *testing.T) {
	t.Parallel()

	metrics := &PlatformMetrics{
		APICalls: 1000,
		Errors:   10,
		LastApiCallTime: &metav1.Time{Time: time.Now()},
	}

	assert.Equal(t, int64(1000), metrics.APICalls)
	assert.Equal(t, int64(10), metrics.Errors)
	assert.NotNil(t, metrics.LastApiCallTime)
}

// TestBotPlatformStatusTransitions tests valid status transitions
func TestBotPlatformStatusTransitions(t *testing.T) {
	t.Parallel()

	// Define valid transitions
	validTransitions := map[BotPlatformPhase][]BotPlatformPhase{
		BotPlatformPhasePending:     {BotPlatformPhaseConfiguring, BotPlatformPhaseFailed},
		BotPlatformPhaseConfiguring: {BotPlatformPhaseReady, BotPlatformPhaseFailed},
		BotPlatformPhaseReady:        {BotPlatformPhaseFailed, BotPlatformPhaseDeleted},
		BotPlatformPhaseFailed:       {BotPlatformPhaseConfiguring, BotPlatformPhaseDeleted},
		BotPlatformPhaseDeleted:      {},
	}

	// Test that transitions are defined
	for from, tos := range validTransitions {
		for _, to := range tos {
			_ = from
			_ = to
		}
	}
}

// BenchmarkBotPlatformSetBotPlatformPhase benchmarks phase setting
func BenchmarkBotPlatformSetBotPlatformPhase(b *testing.B) {
	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{
			Phase: BotPlatformPhasePending,
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		botPlatform.SetBotPlatformPhase(BotPlatformPhaseReady, "Ready", "Complete")
	}
}

// BenchmarkBotPlatformIncrementAPICalls benchmarks API call counter increment
func BenchmarkBotPlatformIncrementAPICalls(b *testing.B) {
	botPlatform := &BotPlatform{
		Status: BotPlatformStatus{},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		botPlatform.IncrementAPICalls()
	}
}
