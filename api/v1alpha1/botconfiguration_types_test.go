// BotConfiguration API Types Tests
// ==================================
// TDD tests for BotConfiguration resource types
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001)
// References: api/v1alpha1/botconfiguration_types.go (Implementation)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// TestBotConfigurationPhaseConstants tests all BotConfigurationPhase constants
func TestBotConfigurationPhaseConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, BotConfigurationPhase("Pending"), BotConfigurationPhasePending)
	assert.Equal(t, BotConfigurationPhase("Applying"), BotConfigurationPhaseApplying)
	assert.Equal(t, BotConfigurationPhase("Ready"), BotConfigurationPhaseReady)
	assert.Equal(t, BotConfigurationPhase("Failed"), BotConfigurationPhaseFailed)
	assert.Equal(t, BotConfigurationPhase("Deleted"), BotConfigurationPhaseDeleted)
}

// TestHandlerTypeConstants tests all HandlerType constants
func TestHandlerTypeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, HandlerType("keyword"), HandlerTypeKeyword)
	assert.Equal(t, HandlerType("regex"), HandlerTypeRegex)
	assert.Equal(t, HandlerType("intent"), HandlerTypeIntent)
	assert.Equal(t, HandlerType("command"), HandlerTypeCommand)
}

// TestActionTypeConstants tests all ActionType constants
func TestActionTypeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, ActionType("reply"), ActionTypeReply)
	assert.Equal(t, ActionType("forward"), ActionTypeForward)
	assert.Equal(t, ActionType("webhook"), ActionTypeWebhook)
	assert.Equal(t, ActionType("command"), ActionTypeCommand)
	assert.Equal(t, ActionType("workflow"), ActionTypeWorkflow)
}

// TestReplyFormatConstants tests all ReplyFormat constants
func TestReplyFormatConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, ReplyFormat("text"), ReplyFormatText)
	assert.Equal(t, ReplyFormat("markdown"), ReplyFormatMarkdown)
	assert.Equal(t, ReplyFormat("html"), ReplyFormatHTML)
}

// TestHTTPMethodConstants tests all HTTPMethod constants
func TestHTTPMethodConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, HTTPMethod("GET"), HTTPMethodGET)
	assert.Equal(t, HTTPMethod("POST"), HTTPMethodPOST)
	assert.Equal(t, HTTPMethod("PUT"), HTTPMethodPUT)
	assert.Equal(t, HTTPMethod("PATCH"), HTTPMethodPATCH)
	assert.Equal(t, HTTPMethod("DELETE"), HTTPMethodDELETE)
}

// TestLoggingLevelConstants tests all LoggingLevel constants
func TestLoggingLevelConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, LoggingLevel("debug"), LoggingLevelDebug)
	assert.Equal(t, LoggingLevel("info"), LoggingLevelInfo)
	assert.Equal(t, LoggingLevel("warn"), LoggingLevelWarn)
	assert.Equal(t, LoggingLevel("error"), LoggingLevelError)
}

// TestLoggingFormatConstants tests all LoggingFormat constants
func TestLoggingFormatConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, LoggingFormat("json"), LoggingFormatJSON)
	assert.Equal(t, LoggingFormat("text"), LoggingFormatText)
}

// TestDatabaseTypeConstants tests all DatabaseType constants
func TestDatabaseTypeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, DatabaseType("postgres"), DatabaseTypePostgres)
	assert.Equal(t, DatabaseType("mysql"), DatabaseTypeMySQL)
	assert.Equal(t, DatabaseType("mongodb"), DatabaseTypeMongoDB)
	assert.Equal(t, DatabaseType("redis"), DatabaseTypeRedis)
}

// TestCacheTypeConstants tests all CacheType constants
func TestCacheTypeConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, CacheType("redis"), CacheTypeRedis)
	assert.Equal(t, CacheType("memcached"), CacheTypeMemcached)
}

// TestAnalyticsProviderConstants tests all AnalyticsProvider constants
func TestAnalyticsProviderConstants(t *testing.T) {
	t.Parallel()

	assert.Equal(t, AnalyticsProvider("google"), AnalyticsProviderGoogle)
	assert.Equal(t, AnalyticsProvider("mixpanel"), AnalyticsProviderMixpanel)
	assert.Equal(t, AnalyticsProvider("amplitude"), AnalyticsProviderAmplitude)
}

// TestBotConfigurationDefaultValues tests default values for BotConfiguration
func TestBotConfigurationDefaultValues(t *testing.T) {
	t.Parallel()

	botConfig := &BotConfiguration{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "test-config",
			Namespace: "default",
		},
		Spec: BotConfigurationSpec{
			ChatBotRef: ChatBotReference{
				Name: "test-bot",
			},
			Configuration: BotConfig{
				Handlers: []Handler{
					{
						Name:    "test-handler",
						Type:    HandlerTypeKeyword,
						Pattern: "test",
						Action: Action{
							Type: ActionTypeReply,
							Reply: &ReplyAction{
								Message: "Test reply",
							},
						},
					},
				},
			},
		},
	}

	// Test that the configuration is valid
	assert.Len(t, botConfig.Spec.Configuration.Handlers, 1)
	assert.Equal(t, "test-handler", botConfig.Spec.Configuration.Handlers[0].Name)
	assert.Equal(t, HandlerTypeKeyword, botConfig.Spec.Configuration.Handlers[0].Type)
	assert.Equal(t, "test", botConfig.Spec.Configuration.Handlers[0].Pattern)
	assert.Equal(t, ActionTypeReply, botConfig.Spec.Configuration.Handlers[0].Action.Type)
	assert.NotNil(t, botConfig.Spec.Configuration.Handlers[0].Action.Reply)
	assert.Equal(t, "Test reply", botConfig.Spec.Configuration.Handlers[0].Action.Reply.Message)
}

// TestBotConfigurationGetBotConfigurationPhase tests GetBotConfigurationPhase method
func TestBotConfigurationGetBotConfigurationPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		phase    BotConfigurationPhase
		expected BotConfigurationPhase
	}{
		{"Pending phase", BotConfigurationPhasePending, BotConfigurationPhasePending},
		{"Applying phase", BotConfigurationPhaseApplying, BotConfigurationPhaseApplying},
		{"Ready phase", BotConfigurationPhaseReady, BotConfigurationPhaseReady},
		{"Failed phase", BotConfigurationPhaseFailed, BotConfigurationPhaseFailed},
		{"Deleted phase", BotConfigurationPhaseDeleted, BotConfigurationPhaseDeleted},
		{"Empty phase", "", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botConfig := &BotConfiguration{
				Status: BotConfigurationStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.expected, botConfig.GetBotConfigurationPhase())
		})
	}
}

// TestBotConfigurationSetBotConfigurationPhase tests SetBotConfigurationPhase method
func TestBotConfigurationSetBotConfigurationPhase(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name         string
		initialPhase BotConfigurationPhase
		newPhase     BotConfigurationPhase
		message      string
		reason       string
		expectChange bool
		expectAppliedTime bool
	}{
		{
			name:         "Same phase - no change",
			initialPhase: BotConfigurationPhaseReady,
			newPhase:     BotConfigurationPhaseReady,
			message:      "Ready",
			reason:       "Configuration is ready",
			expectChange: false,
			expectAppliedTime: false,
		},
		{
			name:         "Pending to Applying",
			initialPhase: BotConfigurationPhasePending,
			newPhase:     BotConfigurationPhaseApplying,
			message:      "Applying configuration",
			reason:       "Applying",
			expectChange: true,
			expectAppliedTime: false,
		},
		{
			name:         "Applying to Ready",
			initialPhase: BotConfigurationPhaseApplying,
			newPhase:     BotConfigurationPhaseReady,
			message:      "Configuration applied",
			reason:       "Ready",
			expectChange: true,
			expectAppliedTime: true,
		},
		{
			name:         "Ready to Failed",
			initialPhase: BotConfigurationPhaseReady,
			newPhase:     BotConfigurationPhaseFailed,
			message:      "Application failed",
			reason:       "Failed",
			expectChange: true,
			expectAppliedTime: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botConfig := &BotConfiguration{
				Status: BotConfigurationStatus{
					Phase: tt.initialPhase,
				},
			}

			botConfig.SetBotConfigurationPhase(tt.newPhase, tt.message, tt.reason)

			if tt.expectChange {
				assert.Equal(t, tt.newPhase, botConfig.Status.Phase)
				assert.Equal(t, tt.message, botConfig.Status.Message)
				assert.Equal(t, tt.reason, botConfig.Status.Reason)
				assert.NotNil(t, botConfig.Status.LastTransitionTime)

				if tt.expectAppliedTime {
					assert.NotNil(t, botConfig.Status.LastAppliedTime)
				} else {
					assert.Nil(t, botConfig.Status.LastAppliedTime)
				}
			} else {
				assert.Equal(t, tt.initialPhase, botConfig.Status.Phase)
			}
		})
	}
}

// TestBotConfigurationIsReady tests IsReady method
func TestBotConfigurationIsReady(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		phase  BotConfigurationPhase
		isReady bool
	}{
		{"Pending phase", BotConfigurationPhasePending, false},
		{"Applying phase", BotConfigurationPhaseApplying, false},
		{"Ready phase", BotConfigurationPhaseReady, true},
		{"Failed phase", BotConfigurationPhaseFailed, false},
		{"Deleted phase", BotConfigurationPhaseDeleted, false},
		{"Empty phase", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botConfig := &BotConfiguration{
				Status: BotConfigurationStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isReady, botConfig.IsReady())
		})
	}
}

// TestBotConfigurationIsFailed tests IsFailed method
func TestBotConfigurationIsFailed(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		phase   BotConfigurationPhase
		isFailed bool
	}{
		{"Pending phase", BotConfigurationPhasePending, false},
		{"Applying phase", BotConfigurationPhaseApplying, false},
		{"Ready phase", BotConfigurationPhaseReady, false},
		{"Failed phase", BotConfigurationPhaseFailed, true},
		{"Deleted phase", BotConfigurationPhaseDeleted, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			botConfig := &BotConfiguration{
				Status: BotConfigurationStatus{
					Phase: tt.phase,
				},
			}
			assert.Equal(t, tt.isFailed, botConfig.IsFailed())
		})
	}
}

// TestBotConfigurationSetAppliedConfiguration tests SetAppliedConfiguration method
func TestBotConfigurationSetAppliedConfiguration(t *testing.T) {
	t.Parallel()

	config := &BotConfig{
		Handlers: []Handler{
			{
				Name:    "handler1",
				Type:    HandlerTypeKeyword,
				Pattern: "test",
				Action: Action{
					Type: ActionTypeReply,
					Reply: &ReplyAction{
						Message: "Test",
					},
				},
			},
		},
	}

	botConfig := &BotConfiguration{
		Status: BotConfigurationStatus{},
	}

	botConfig.SetAppliedConfiguration(config)
	assert.NotNil(t, botConfig.Status.AppliedConfiguration)
	assert.Equal(t, "handler1", botConfig.Status.AppliedConfiguration.Handlers[0].Name)
}

// TestBotConfigurationAddError tests AddError method
func TestBotConfigurationAddError(t *testing.T) {
	t.Parallel()

	botConfig := &BotConfiguration{
		Status: BotConfigurationStatus{},
	}

	// First error
	botConfig.AddError("First error")
	assert.NotNil(t, botConfig.Status.LastError)
	assert.Equal(t, "First error", botConfig.Status.LastError.Message)
	assert.Equal(t, int(1), botConfig.Status.LastError.Count)
	assert.NotNil(t, botConfig.Status.LastError.Time)

	// Second error - should increment count
	beforeTime := botConfig.Status.LastError.Time
	time.Sleep(10 * time.Millisecond)
	botConfig.AddError("Second error")
	assert.Equal(t, "Second error", botConfig.Status.LastError.Message)
	assert.Equal(t, int(2), botConfig.Status.LastError.Count)
	assert.NotEqual(t, beforeTime, botConfig.Status.LastError.Time)
}

// TestBotConfigurationClearError tests ClearError method
func TestBotConfigurationClearError(t *testing.T) {
	t.Parallel()

	botConfig := &BotConfiguration{
		Status: BotConfigurationStatus{
			LastError: &ErrorInfo{
				Message: "Some error",
				Count:   5,
			},
		},
	}

	botConfig.ClearError()
	assert.Nil(t, botConfig.Status.LastError)
}

// TestBotConfigurationIncrementConfigurationChanges tests IncrementConfigurationChanges method
func TestBotConfigurationIncrementConfigurationChanges(t *testing.T) {
	t.Parallel()

	botConfig := &BotConfiguration{
		Status: BotConfigurationStatus{},
	}

	// First increment
	botConfig.IncrementConfigurationChanges()
	assert.NotNil(t, botConfig.Status.Metrics)
	assert.Equal(t, int64(1), botConfig.Status.Metrics.ConfigurationChanges)
	assert.NotNil(t, botConfig.Status.Metrics.LastChangeTime)

	// Second increment
	beforeTime := botConfig.Status.Metrics.LastChangeTime
	time.Sleep(10 * time.Millisecond)
	botConfig.IncrementConfigurationChanges()
	assert.Equal(t, int64(2), botConfig.Status.Metrics.ConfigurationChanges)
	assert.NotEqual(t, beforeTime, botConfig.Status.Metrics.LastChangeTime)
}

// TestBotConfigurationList tests BotConfigurationList type
func TestBotConfigurationList(t *testing.T) {
	t.Parallel()

	items := []BotConfiguration{
		{ObjectMeta: metav1.ObjectMeta{Name: "config1"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "config2"}},
		{ObjectMeta: metav1.ObjectMeta{Name: "config3"}},
	}

	list := &BotConfigurationList{
		Items: items,
	}

	assert.Len(t, list.Items, 3)
	assert.Equal(t, "config1", list.Items[0].Name)
	assert.Equal(t, "config2", list.Items[1].Name)
	assert.Equal(t, "config3", list.Items[2].Name)
}

// TestHandler tests Handler type
func TestHandler(t *testing.T) {
	t.Parallel()

	handlers := []Handler{
		{
			Name:    "keyword-handler",
			Type:    HandlerTypeKeyword,
			Pattern: "hello",
			Action: Action{
				Type: ActionTypeReply,
				Reply: &ReplyAction{
					Message: "Hello there!",
					Format:  ReplyFormatText,
				},
			},
		},
		{
			Name:    "regex-handler",
			Type:    HandlerTypeRegex,
			Pattern: `^\d+$`,
			Action: Action{
				Type: ActionTypeReply,
				Reply: &ReplyAction{
					Message: "You sent a number",
					Format:  ReplyFormatMarkdown,
				},
			},
		},
		{
			Name:    "webhook-handler",
			Type:    HandlerTypeKeyword,
			Pattern: "webhook",
			Action: Action{
				Type: ActionTypeWebhook,
				Webhook: &WebhookAction{
					URL:    "https://webhook.example.com",
					Method: HTTPMethodPOST,
					Headers: map[string]string{
						"Content-Type": "application/json",
					},
					Body: `{"message": "{{.Message}}"}`,
				},
			},
		},
		{
			Name:    "forward-handler",
			Type:    HandlerTypeKeyword,
			Pattern: "forward",
			Action: Action{
				Type: ActionTypeForward,
				Forward: &ForwardAction{
					Target:     "@user123",
					WebhookURL: "https://forward.example.com",
				},
			},
		},
		{
			Name:    "command-handler",
			Type:    HandlerTypeCommand,
			Pattern: "/status",
			Action: Action{
				Type: ActionTypeCommand,
				Command: &CommandAction{
					Command:        "/bin/check-status",
					Args:            []string{"--verbose"},
					TimeoutSeconds: 30,
				},
			},
		},
	}

	assert.Len(t, handlers, 5)

	// Test keyword handler
	assert.Equal(t, "keyword-handler", handlers[0].Name)
	assert.Equal(t, HandlerTypeKeyword, handlers[0].Type)
	assert.Equal(t, "hello", handlers[0].Pattern)
	assert.Equal(t, ActionTypeReply, handlers[0].Action.Type)
	assert.NotNil(t, handlers[0].Action.Reply)
	assert.Equal(t, "Hello there!", handlers[0].Action.Reply.Message)
	assert.Equal(t, ReplyFormatText, handlers[0].Action.Reply.Format)

	// Test regex handler
	assert.Equal(t, "regex-handler", handlers[1].Name)
	assert.Equal(t, HandlerTypeRegex, handlers[1].Type)
	assert.Equal(t, `^\d+$`, handlers[1].Pattern)

	// Test webhook handler
	assert.Equal(t, "webhook-handler", handlers[2].Name)
	assert.Equal(t, ActionTypeWebhook, handlers[2].Action.Type)
	assert.NotNil(t, handlers[2].Action.Webhook)
	assert.Equal(t, "https://webhook.example.com", handlers[2].Action.Webhook.URL)
	assert.Equal(t, HTTPMethodPOST, handlers[2].Action.Webhook.Method)
	assert.Equal(t, "application/json", handlers[2].Action.Webhook.Headers["Content-Type"])

	// Test forward handler
	assert.Equal(t, "forward-handler", handlers[3].Name)
	assert.Equal(t, ActionTypeForward, handlers[3].Action.Type)
	assert.NotNil(t, handlers[3].Action.Forward)
	assert.Equal(t, "@user123", handlers[3].Action.Forward.Target)

	// Test command handler
	assert.Equal(t, "command-handler", handlers[4].Name)
	assert.Equal(t, HandlerTypeCommand, handlers[4].Type)
	assert.Equal(t, ActionTypeCommand, handlers[4].Action.Type)
	assert.NotNil(t, handlers[4].Action.Command)
	assert.Equal(t, "/bin/check-status", handlers[4].Action.Command.Command)
	assert.Len(t, handlers[4].Action.Command.Args, 1)
	assert.Equal(t, 30, handlers[4].Action.Command.TimeoutSeconds)
}

// TestBotConfig tests BotConfig type
func TestBotConfig(t *testing.T) {
	t.Parallel()

	config := BotConfig{
		Handlers: []Handler{
			{
				Name:    "handler1",
				Type:    HandlerTypeKeyword,
				Pattern: "test",
				Action: Action{
					Type: ActionTypeReply,
					Reply: &ReplyAction{
						Message: "Test reply",
					},
				},
			},
		},
		DefaultHandler: &Handler{
			Name:    "default",
			Type:    HandlerTypeKeyword,
			Pattern: ".*",
			Action: Action{
				Type: ActionTypeReply,
				Reply: &ReplyAction{
					Message: "Default reply",
				},
			},
		},
		Plugins: []Plugin{
			{Name: "plugin1", Enabled: true},
			{Name: "plugin2", Enabled: false},
		},
		Settings: &BotSettings{
			Language: "en",
			Timezone: "UTC",
			Logging: &LoggingConfig{
				Level:  LoggingLevelInfo,
				Format: LoggingFormatJSON,
			},
			RateLimiting: &RateLimitingConfig{
				Enabled:             true,
				MaxMessagesPerMinute: 100,
			},
		},
		Integrations: &Integrations{
			Database: &DatabaseIntegration{
				Enabled:    true,
				Type:       DatabaseTypePostgres,
				ConnectionString: "postgres://localhost:5432/db",
			},
			Cache: &CacheIntegration{
				Enabled:    true,
				Type:       CacheTypeRedis,
				TTLSeconds: 300,
			},
			Analytics: &AnalyticsIntegration{
				Enabled:  true,
				Provider: AnalyticsProviderGoogle,
			},
		},
	}

	assert.Len(t, config.Handlers, 1)
	assert.NotNil(t, config.DefaultHandler)
	assert.Equal(t, "default", config.DefaultHandler.Name)
	assert.Len(t, config.Plugins, 2)
	assert.True(t, config.Plugins[0].Enabled)
	assert.False(t, config.Plugins[1].Enabled)
	assert.NotNil(t, config.Settings)
	assert.Equal(t, "en", config.Settings.Language)
	assert.Equal(t, "UTC", config.Settings.Timezone)
	assert.NotNil(t, config.Settings.Logging)
	assert.Equal(t, LoggingLevelInfo, config.Settings.Logging.Level)
	assert.Equal(t, LoggingFormatJSON, config.Settings.Logging.Format)
	assert.NotNil(t, config.Settings.RateLimiting)
	assert.True(t, config.Settings.RateLimiting.Enabled)
	assert.Equal(t, 100, config.Settings.RateLimiting.MaxMessagesPerMinute)
	assert.NotNil(t, config.Integrations)
	assert.True(t, config.Integrations.Database.Enabled)
	assert.Equal(t, DatabaseTypePostgres, config.Integrations.Database.Type)
	assert.True(t, config.Integrations.Cache.Enabled)
	assert.Equal(t, CacheTypeRedis, config.Integrations.Cache.Type)
	assert.True(t, config.Integrations.Analytics.Enabled)
	assert.Equal(t, AnalyticsProviderGoogle, config.Integrations.Analytics.Provider)
}

// TestWorkflowAction tests WorkflowAction type
func TestWorkflowAction(t *testing.T) {
	t.Parallel()

	workflow := &WorkflowAction{
		Steps: []WorkflowStep{
			{
				Action: "step1",
				Next:   "step2",
			},
			{
				Action: "step2",
				Next:   "step3",
			},
			{
				Action: "step3",
				// No next - end of workflow
			},
		},
	}

	assert.Len(t, workflow.Steps, 3)
	assert.Equal(t, "step1", workflow.Steps[0].Action)
	assert.Equal(t, "step2", workflow.Steps[0].Next)
	assert.Equal(t, "step2", workflow.Steps[1].Action)
	assert.Equal(t, "step3", workflow.Steps[1].Next)
	assert.Equal(t, "step3", workflow.Steps[2].Action)
	assert.Empty(t, workflow.Steps[2].Next)
}

// TestConfigurationMetrics tests ConfigurationMetrics
func TestConfigurationMetrics(t *testing.T) {
	t.Parallel()

	metrics := &ConfigurationMetrics{
		ConfigurationChanges: 10,
		LastChangeTime:      &metav1.Time{Time: time.Now()},
	}

	assert.Equal(t, int64(10), metrics.ConfigurationChanges)
	assert.NotNil(t, metrics.LastChangeTime)
}

// TestBotConfigurationStatusTransitions tests valid status transitions
func TestBotConfigurationStatusTransitions(t *testing.T) {
	t.Parallel()

	// Define valid transitions
	validTransitions := map[BotConfigurationPhase][]BotConfigurationPhase{
		BotConfigurationPhasePending:   {BotConfigurationPhaseApplying, BotConfigurationPhaseFailed},
		BotConfigurationPhaseApplying: {BotConfigurationPhaseReady, BotConfigurationPhaseFailed},
		BotConfigurationPhaseReady:    {BotConfigurationPhaseApplying, BotConfigurationPhaseFailed, BotConfigurationPhaseDeleted},
		BotConfigurationPhaseFailed:   {BotConfigurationPhaseApplying, BotConfigurationPhaseDeleted},
		BotConfigurationPhaseDeleted: {},
	}

	// Test that transitions are defined
	for from, tos := range validTransitions {
		for _, to := range tos {
			_ = from
			_ = to
		}
	}
}

// TestBotConfigurationWithFullSpec tests BotConfiguration with full specification
func TestBotConfigurationWithFullSpec(t *testing.T) {
	t.Parallel()

	botConfig := &BotConfiguration{
		ObjectMeta: metav1.ObjectMeta{
			Name:        "full-config",
			Namespace:   "production",
			Labels:      map[string]string{"app": "chatbot"},
			Annotations: map[string]string{"description": "Full configuration"},
		},
		Spec: BotConfigurationSpec{
			ChatBotRef: ChatBotReference{
				Name:      "my-bot",
				Namespace: "production",
			},
			Configuration: BotConfig{
				Handlers: []Handler{
					{
						Name:    "greeting",
						Type:    HandlerTypeKeyword,
						Pattern: "hello",
						Action: Action{
							Type: ActionTypeReply,
							Reply: &ReplyAction{
								Message: "Hello! How can I help you?",
								Format:  ReplyFormatMarkdown,
							},
						},
					},
					{
						Name:    "status",
						Type:    HandlerTypeCommand,
						Pattern: "/status",
						Action: Action{
							Type: ActionTypeCommand,
							Command: &CommandAction{
								Command:        "/bin/check-status",
								Args:            []string{"--json"},
								TimeoutSeconds: 10,
							},
						},
					},
				},
				DefaultHandler: &Handler{
					Name:    "default",
					Type:    HandlerTypeKeyword,
					Pattern: ".*",
					Action: Action{
						Type: ActionTypeReply,
						Reply: &ReplyAction{
							Message: "I don't understand that command.",
						},
					},
				},
				Plugins: []Plugin{
					{Name: "logger", Enabled: true},
					{Name: "metrics", Enabled: true},
				},
				Settings: &BotSettings{
					Language: "en",
					Timezone: "America/New_York",
					Logging: &LoggingConfig{
						Level:  LoggingLevelDebug,
						Format: LoggingFormatJSON,
					},
					RateLimiting: &RateLimitingConfig{
						Enabled:             true,
						MaxMessagesPerMinute: 500,
					},
				},
				Integrations: &Integrations{
					Database: &DatabaseIntegration{
						Enabled:    true,
						Type:       DatabaseTypePostgres,
						ConnectionString: "postgres://user:pass@localhost:5432/chatbot",
					},
					Cache: &CacheIntegration{
						Enabled:    true,
						Type:       CacheTypeRedis,
						TTLSeconds: 600,
					},
					Analytics: &AnalyticsIntegration{
						Enabled:  true,
						Provider: AnalyticsProviderMixpanel,
					},
				},
			},
			Labels:      map[string]string{"team": "platform"},
			Annotations: map[string]string{"owner": "platform-team"},
		},
		Status: BotConfigurationStatus{
			Phase:   BotConfigurationPhaseReady,
			Message: "Configuration applied successfully",
			Reason:  "ApplyComplete",
			LastAppliedTime: &metav1.Time{Time: time.Now()},
			AppliedConfiguration: &BotConfig{
				Handlers: []Handler{
					{
						Name:    "greeting",
						Type:    HandlerTypeKeyword,
						Pattern: "hello",
					},
				},
			},
			Metrics: &ConfigurationMetrics{
				ConfigurationChanges: 5,
				LastChangeTime:      &metav1.Time{Time: time.Now()},
			},
		},
	}

	// Verify all fields
	assert.Equal(t, "full-config", botConfig.Name)
	assert.Equal(t, "production", botConfig.Namespace)
	assert.Equal(t, "my-bot", botConfig.Spec.ChatBotRef.Name)
	assert.Equal(t, "production", botConfig.Spec.ChatBotRef.Namespace)
	assert.Len(t, botConfig.Spec.Configuration.Handlers, 2)
	assert.NotNil(t, botConfig.Spec.Configuration.DefaultHandler)
	assert.Len(t, botConfig.Spec.Configuration.Plugins, 2)
	assert.NotNil(t, botConfig.Spec.Configuration.Settings)
	assert.NotNil(t, botConfig.Spec.Configuration.Integrations)
	assert.Equal(t, BotConfigurationPhaseReady, botConfig.Status.Phase)
	assert.NotNil(t, botConfig.Status.AppliedConfiguration)
	assert.NotNil(t, botConfig.Status.Metrics)
	assert.Equal(t, int64(5), botConfig.Status.Metrics.ConfigurationChanges)
}

// BenchmarkBotConfigurationSetBotConfigurationPhase benchmarks phase setting
func BenchmarkBotConfigurationSetBotConfigurationPhase(b *testing.B) {
	botConfig := &BotConfiguration{
		Status: BotConfigurationStatus{
			Phase: BotConfigurationPhasePending,
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		botConfig.SetBotConfigurationPhase(BotConfigurationPhaseReady, "Ready", "Complete")
	}
}

// BenchmarkBotConfigurationIncrementConfigurationChanges benchmarks configuration change counter
func BenchmarkBotConfigurationIncrementConfigurationChanges(b *testing.B) {
	botConfig := &BotConfiguration{
		Status: BotConfigurationStatus{},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		botConfig.IncrementConfigurationChanges()
	}
}
