// BotConfiguration API Types
// ==============================
// Defines the BotConfiguration resource types for the ChatBot Operator
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001)
// References: config/crd/bases/chatbotoperator.io_botconfigurations.yaml (CRD definition)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// BotConfiguration defines configuration for a chat bot
type BotConfiguration struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   BotConfigurationSpec   `json:"spec,omitempty"`
	Status BotConfigurationStatus `json:"status,omitempty"`
}

// BotConfigurationSpec defines the desired state of a BotConfiguration
type BotConfigurationSpec struct {
	// ChatBotRef is the reference to the ChatBot this configuration applies to
	// +kubebuilder:validation:Required
	ChatBotRef ChatBotReference `json:"chatBotRef"`

	// Configuration is the configuration for the bot
	// +kubebuilder:validation:Required
	Configuration BotConfig `json:"configuration"`

	// Labels for the configuration resource
	// +optional
	Labels map[string]string `json:"labels,omitempty"`

	// Annotations for the configuration resource
	// +optional
	Annotations map[string]string `json:"annotations,omitempty"`
}

// BotConfigurationStatus defines the observed state of a BotConfiguration
type BotConfigurationStatus struct {
	// Phase is the current phase
	// +kubebuilder:validation:Enum=Pending;Applying;Ready;Failed;Deleted
	Phase BotConfigurationPhase `json:"phase,omitempty"`

	// Message is a human-readable message about the current status
	Message string `json:"message,omitempty"`

	// Reason is a machine-readable reason for the current status
	Reason string `json:"reason,omitempty"`

	// LastTransitionTime is the time of the last status transition
	// +optional
	LastTransitionTime *metav1.Time `json:"lastTransitionTime,omitempty"`

	// LastAppliedTime is the time when configuration was last applied
	// +optional
	LastAppliedTime *metav1.Time `json:"lastAppliedTime,omitempty"`

	// AppliedConfiguration is the configuration that was last applied
	// +optional
	AppliedConfiguration *BotConfig `json:"appliedConfiguration,omitempty"`

	// LastError contains information about the last error, if any
	// +optional
	LastError *ErrorInfo `json:"lastError,omitempty"`

	// Metrics for this configuration
	// +optional
	Metrics *ConfigurationMetrics `json:"metrics,omitempty"`
}

// BotConfigurationPhase defines the possible phases of a BotConfiguration
type BotConfigurationPhase string

const (
	// BotConfigurationPhasePending indicates the configuration is waiting to be applied
	BotConfigurationPhasePending BotConfigurationPhase = "Pending"
	// BotConfigurationPhaseApplying indicates the configuration is being applied
	BotConfigurationPhaseApplying BotConfigurationPhase = "Applying"
	// BotConfigurationPhaseReady indicates the configuration is applied and ready
	BotConfigurationPhaseReady BotConfigurationPhase = "Ready"
	// BotConfigurationPhaseFailed indicates the configuration application failed
	BotConfigurationPhaseFailed BotConfigurationPhase = "Failed"
	// BotConfigurationPhaseDeleted indicates the configuration has been deleted
	BotConfigurationPhaseDeleted BotConfigurationPhase = "Deleted"
)

// ChatBotReference defines a reference to a ChatBot
type ChatBotReference struct {
	// Name is the name of the ChatBot resource
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Namespace is the namespace of the ChatBot resource (defaults to same as BotConfiguration)
	// +optional
	Namespace string `json:"namespace,omitempty"`
}

// BotConfig defines the configuration for a bot
type BotConfig struct {
	// Handlers is the list of message handlers
	// +kubebuilder:validation:MinItems=1
	// +kubebuilder:validation:Required
	Handlers []Handler `json:"handlers"`

	// DefaultHandler is the default handler for messages that don't match any pattern
	// +optional
	DefaultHandler *Handler `json:"defaultHandler,omitempty"`

	// Plugins is the list of plugins to load
	// +optional
	Plugins []Plugin `json:"plugins,omitempty"`

	// Settings are the general bot settings
	// +optional
	Settings *BotSettings `json:"settings,omitempty"`

	// Integrations are the external integrations
	// +optional
	Integrations *Integrations `json:"integrations,omitempty"`
}

// Handler defines a message handler
type Handler struct {
	// Name is the name of the handler
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Type is the type of handler
	// +kubebuilder:validation:Enum=keyword;regex;intent;command
	// +kubebuilder:validation:Required
	Type HandlerType `json:"type"`

	// Pattern is the pattern to match against messages
	// +kubebuilder:validation:Required
	Pattern string `json:"pattern"`

	// Action is the action to take when pattern matches
	// +kubebuilder:validation:Required
	Action Action `json:"action"`
}

// HandlerType defines the type of handler
type HandlerType string

const (
	// HandlerTypeKeyword is a keyword-based handler
	HandlerTypeKeyword HandlerType = "keyword"
	// HandlerTypeRegex is a regex-based handler
	HandlerTypeRegex HandlerType = "regex"
	// HandlerTypeIntent is an intent-based handler
	HandlerTypeIntent HandlerType = "intent"
	// HandlerTypeCommand is a command-based handler
	HandlerTypeCommand HandlerType = "command"
)

// Action defines the action to take when a pattern matches
type Action struct {
	// Type is the type of action
	// +kubebuilder:validation:Enum=reply;forward;webhook;command;workflow
	// +kubebuilder:validation:Required
	Type ActionType `json:"type"`

	// Reply is the reply action configuration
	// +optional
	Reply *ReplyAction `json:"reply,omitempty"`

	// Forward is the forward action configuration
	// +optional
	Forward *ForwardAction `json:"forward,omitempty"`

	// Webhook is the webhook action configuration
	// +optional
	Webhook *WebhookAction `json:"webhook,omitempty"`

	// Command is the command action configuration
	// +optional
	Command *CommandAction `json:"command,omitempty"`

	// Workflow is the workflow action configuration
	// +optional
	Workflow *WorkflowAction `json:"workflow,omitempty"`
}

// ActionType defines the type of action
type ActionType string

const (
	// ActionTypeReply is a reply action
	ActionTypeReply ActionType = "reply"
	// ActionTypeForward is a forward action
	ActionTypeForward ActionType = "forward"
	// ActionTypeWebhook is a webhook action
	ActionTypeWebhook ActionType = "webhook"
	// ActionTypeCommand is a command action
	ActionTypeCommand ActionType = "command"
	// ActionTypeWorkflow is a workflow action
	ActionTypeWorkflow ActionType = "workflow"
)

// ReplyAction defines a reply action
type ReplyAction struct {
	// Message is the message to reply with
	Message string `json:"message,omitempty"`

	// Format is the format of the reply
	// +kubebuilder:validation:Enum=text;markdown;html
	// +kubebuilder:default="text"
	Format ReplyFormat `json:"format,omitempty"`
}

// ReplyFormat defines the format of a reply
type ReplyFormat string

const (
	// ReplyFormatText is plain text format
	ReplyFormatText ReplyFormat = "text"
	// ReplyFormatMarkdown is markdown format
	ReplyFormatMarkdown ReplyFormat = "markdown"
	// ReplyFormatHTML is HTML format
	ReplyFormatHTML ReplyFormat = "html"
)

// ForwardAction defines a forward action
type ForwardAction struct {
	// Target is the target to forward to (user, channel, webhook)
	Target string `json:"target,omitempty"`

	// WebhookURL is the webhook URL to forward to
	// +kubebuilder:validation:Format=uri
	WebhookURL string `json:"webhookURL,omitempty"`
}

// WebhookAction defines a webhook action
type WebhookAction struct {
	// URL is the webhook URL to call
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Format=uri
	URL string `json:"url"`

	// Method is the HTTP method
	// +kubebuilder:validation:Enum=GET;POST;PUT;PATCH;DELETE
	// +kubebuilder:default="POST"
	Method HTTPMethod `json:"method,omitempty"`

	// Headers are the HTTP headers
	// +optional
	Headers map[string]string `json:"headers,omitempty"`

	// Body is the request body template
	// +optional
	Body string `json:"body,omitempty"`
}

// HTTPMethod defines the HTTP method
type HTTPMethod string

const (
	// HTTPMethodGET is the GET method
	HTTPMethodGET HTTPMethod = "GET"
	// HTTPMethodPOST is the POST method
	HTTPMethodPOST HTTPMethod = "POST"
	// HTTPMethodPUT is the PUT method
	HTTPMethodPUT HTTPMethod = "PUT"
	// HTTPMethodPATCH is the PATCH method
	HTTPMethodPATCH HTTPMethod = "PATCH"
	// HTTPMethodDELETE is the DELETE method
	HTTPMethodDELETE HTTPMethod = "DELETE"
)

// CommandAction defines a command action
type CommandAction struct {
	// Command is the command to execute
	Command string `json:"command,omitempty"`

	// Args are the arguments for the command
	// +optional
	Args []string `json:"args,omitempty"`

	// TimeoutSeconds is the command timeout
	// +kubebuilder:default=30
	TimeoutSeconds int `json:"timeoutSeconds,omitempty"`
}

// WorkflowAction defines a workflow action
type WorkflowAction struct {
	// Steps are the steps in the workflow
	// +optional
	Steps []WorkflowStep `json:"steps,omitempty"`
}

// WorkflowStep defines a step in a workflow
type WorkflowStep struct {
	// Action is the action to perform
	// +kubebuilder:validation:Required
	Action string `json:"action"`

	// Next is the next step if this succeeds
	// +optional
	Next string `json:"next,omitempty"`
}

// Plugin defines a plugin
type Plugin struct {
	// Name is the name of the plugin
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Enabled indicates whether the plugin is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// Configuration is the plugin configuration
	// +optional
	Configuration map[string]string `json:"configuration,omitempty"`
}

// BotSettings defines general bot settings
type BotSettings struct {
	// Language is the default language for the bot
	// +kubebuilder:default="en"
	Language string `json:"language,omitempty"`

	// Timezone is the timezone for the bot
	// +kubebuilder:default="UTC"
	Timezone string `json:"timezone,omitempty"`

	// Logging configuration
	// +optional
	Logging *LoggingConfig `json:"logging,omitempty"`

	// RateLimiting configuration
	// +optional
	RateLimiting *RateLimitingConfig `json:"rateLimiting,omitempty"`
}

// LoggingConfig defines logging configuration
type LoggingConfig struct {
	// Level is the logging level
	// +kubebuilder:validation:Enum=debug;info;warn;error
	// +kubebuilder:default="info"
	Level LoggingLevel `json:"level,omitempty"`

	// Format is the logging format
	// +kubebuilder:validation:Enum=json;text
	// +kubebuilder:default="json"
	Format LoggingFormat `json:"format,omitempty"`
}

// LoggingLevel defines the logging level
type LoggingLevel string

const (
	// LoggingLevelDebug is debug level
	LoggingLevelDebug LoggingLevel = "debug"
	// LoggingLevelInfo is info level
	LoggingLevelInfo LoggingLevel = "info"
	// LoggingLevelWarn is warn level
	LoggingLevelWarn LoggingLevel = "warn"
	// LoggingLevelError is error level
	LoggingLevelError LoggingLevel = "error"
)

// LoggingFormat defines the logging format
type LoggingFormat string

const (
	// LoggingFormatJSON is JSON format
	LoggingFormatJSON LoggingFormat = "json"
	// LoggingFormatText is text format
	LoggingFormatText LoggingFormat = "text"
)

// RateLimitingConfig defines rate limiting configuration
type RateLimitingConfig struct {
	// Enabled indicates whether rate limiting is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// MaxMessagesPerMinute is the maximum messages per minute
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=1000
	// +kubebuilder:default=100
	MaxMessagesPerMinute int `json:"maxMessagesPerMinute,omitempty"`
}

// Integrations defines external integrations
type Integrations struct {
	// Database integration
	// +optional
	Database *DatabaseIntegration `json:"database,omitempty"`

	// Cache integration
	// +optional
	Cache *CacheIntegration `json:"cache,omitempty"`

	// Analytics integration
	// +optional
	Analytics *AnalyticsIntegration `json:"analytics,omitempty"`
}

// DatabaseIntegration defines database integration
type DatabaseIntegration struct {
	// Enabled indicates whether database integration is enabled
	// +kubebuilder:default=false
	Enabled bool `json:"enabled,omitempty"`

	// Type is the database type
	// +kubebuilder:validation:Enum=postgres;mysql;mongodb;redis
	Type DatabaseType `json:"type,omitempty"`

	// ConnectionString is the database connection string (reference to Secret)
	ConnectionString string `json:"connectionString,omitempty"`
}

// DatabaseType defines the database type
type DatabaseType string

const (
	// DatabaseTypePostgres is PostgreSQL
	DatabaseTypePostgres DatabaseType = "postgres"
	// DatabaseTypeMySQL is MySQL
	DatabaseTypeMySQL DatabaseType = "mysql"
	// DatabaseTypeMongoDB is MongoDB
	DatabaseTypeMongoDB DatabaseType = "mongodb"
	// DatabaseTypeRedis is Redis
	DatabaseTypeRedis DatabaseType = "redis"
)

// CacheIntegration defines cache integration
type CacheIntegration struct {
	// Enabled indicates whether cache integration is enabled
	// +kubebuilder:default=false
	Enabled bool `json:"enabled,omitempty"`

	// Type is the cache type
	// +kubebuilder:validation:Enum=redis;memcached
	Type CacheType `json:"type,omitempty"`

	// TTLSeconds is the cache TTL in seconds
	// +kubebuilder:default=300
	TTLSeconds int `json:"ttlSeconds,omitempty"`
}

// CacheType defines the cache type
type CacheType string

const (
	// CacheTypeRedis is Redis cache
	CacheTypeRedis CacheType = "redis"
	// CacheTypeMemcached is Memcached cache
	CacheTypeMemcached CacheType = "memcached"
)

// AnalyticsIntegration defines analytics integration
type AnalyticsIntegration struct {
	// Enabled indicates whether analytics integration is enabled
	// +kubebuilder:default=false
	Enabled bool `json:"enabled,omitempty"`

	// Provider is the analytics provider
	// +kubebuilder:validation:Enum=google;mixpanel;amplitude
	Provider AnalyticsProvider `json:"provider,omitempty"`
}

// AnalyticsProvider defines the analytics provider
type AnalyticsProvider string

const (
	// AnalyticsProviderGoogle is Google Analytics
	AnalyticsProviderGoogle AnalyticsProvider = "google"
	// AnalyticsProviderMixpanel is Mixpanel
	AnalyticsProviderMixpanel AnalyticsProvider = "mixpanel"
	// AnalyticsProviderAmplitude is Amplitude
	AnalyticsProviderAmplitude AnalyticsProvider = "amplitude"
)

// ConfigurationMetrics defines metrics for a configuration
type ConfigurationMetrics struct {
	// ConfigurationChanges is the number of configuration changes
	// +kubebuilder:default=0
	ConfigurationChanges int64 `json:"configurationChanges,omitempty"`

	// LastChangeTime is the time of the last configuration change
	// +optional
	LastChangeTime *metav1.Time `json:"lastChangeTime,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// BotConfigurationList contains a list of BotConfiguration resources
type BotConfigurationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []BotConfiguration `json:"items"`
}

// GetBotConfigurationPhase returns the current phase of the BotConfiguration
func (bc *BotConfiguration) GetBotConfigurationPhase() BotConfigurationPhase {
	return bc.Status.Phase
}

// SetBotConfigurationPhase sets the phase of the BotConfiguration and updates the transition time
func (bc *BotConfiguration) SetBotConfigurationPhase(phase BotConfigurationPhase, message, reason string) {
	if bc.Status.Phase != phase {
		bc.Status.Phase = phase
		bc.Status.Message = message
		bc.Status.Reason = reason
		now := metav1.Now()
		bc.Status.LastTransitionTime = &now
		
		// Update last applied time for Ready phase
		if phase == BotConfigurationPhaseReady {
			bc.Status.LastAppliedTime = &now
		}
	}
}

// IsReady returns true if the BotConfiguration is in Ready phase
func (bc *BotConfiguration) IsReady() bool {
	return bc.Status.Phase == BotConfigurationPhaseReady
}

// IsFailed returns true if the BotConfiguration is in Failed phase
func (bc *BotConfiguration) IsFailed() bool {
	return bc.Status.Phase == BotConfigurationPhaseFailed
}

// SetAppliedConfiguration sets the applied configuration
func (bc *BotConfiguration) SetAppliedConfiguration(config *BotConfig) {
	bc.Status.AppliedConfiguration = config
}

// AddError records an error in the BotConfiguration status
func (bc *BotConfiguration) AddError(message string) {
	now := metav1.Now()
	if bc.Status.LastError == nil {
		bc.Status.LastError = &ErrorInfo{}
	}
	
	bc.Status.LastError.Message = message
	bc.Status.LastError.Time = &now
	bc.Status.LastError.Count++
}

// ClearError clears the last error from the BotConfiguration status
func (bc *BotConfiguration) ClearError() {
	bc.Status.LastError = nil
}

// IncrementConfigurationChanges increments the configuration changes counter
func (bc *BotConfiguration) IncrementConfigurationChanges() {
	if bc.Status.Metrics == nil {
		bc.Status.Metrics = &ConfigurationMetrics{}
	}
	bc.Status.Metrics.ConfigurationChanges++
	bc.Status.Metrics.LastChangeTime = &metav1.Time{Time: metav1.Now().Time}
}
