// ChatBot API Types
// ====================
// Defines the ChatBot resource types for the ChatBot Operator
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
// References: config/crd/bases/chatbotoperator.io_chatbots.yaml (CRD definition)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ChatBot defines a chat bot instance to be managed by the ChatBot Operator
type ChatBot struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ChatBotSpec   `json:"spec,omitempty"`
	Status ChatBotStatus `json:"status,omitempty"`
}

// ChatBotSpec defines the desired state of a ChatBot
type ChatBotSpec struct {
	// Platform is the chat platform for this bot (slack, matrix, discord, twilio)
	// +kubebuilder:validation:Enum=slack;matrix;discord;twilio
	// +kubebuilder:validation:Required
	Platform PlatformType `json:"platform"`

	// Name is the name of the chat bot
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=63
	// +kubebuilder:validation:Pattern=^[a-z0-9]([-a-z0-9]*[a-z0-9])?$
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// DisplayName is the user-friendly display name of the bot
	// +kubebuilder:validation:MaxLength=100
	DisplayName string `json:"displayName,omitempty"`

	// Description is the description of the bot's purpose
	// +kubebuilder:validation:MaxLength=500
	Description string `json:"description,omitempty"`

	// Configuration is the platform-specific configuration for the bot
	// +kubebuilder:validation:Required
	Configuration BotConfigurationSpec `json:"configuration"`

	// Credentials is the reference to credentials for the platform
	Credentials CredentialReference `json:"credentials,omitempty"`

	// Labels for the bot resource
	// +optional
	Labels map[string]string `json:"labels,omitempty"`

	// Annotations for the bot resource
	// +optional
	Annotations map[string]string `json:"annotations,omitempty"`

	// Enabled indicates whether the bot is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// TLS configuration for the bot
	// +optional
	TLS *TLSConfig `json:"tls,omitempty"`

	// Monitoring configuration
	// +optional
	Monitoring *MonitoringConfig `json:"monitoring,omitempty"`

	// Resource requirements for the bot deployment
	// +optional
	Resources *ResourceRequirements `json:"resources,omitempty"`
}

// ChatBotStatus defines the observed state of a ChatBot
type ChatBotStatus struct {
	// Phase is the current phase of the ChatBot lifecycle
	// +kubebuilder:validation:Enum=Pending;Provisioning;Ready;Updating;Terminating;Failed;Deleted
	Phase ChatBotPhase `json:"phase,omitempty"`

	// Message is a human-readable message about the current status
	Message string `json:"message,omitempty"`

	// Reason is a machine-readable reason for the current status
	Reason string `json:"reason,omitempty"`

	// LastTransitionTime is the time of the last status transition
	// +optional
	LastTransitionTime *metav1.Time `json:"lastTransitionTime,omitempty"`

	// ProvisioningStartTime is the time when provisioning started
	// +optional
	ProvisioningStartTime *metav1.Time `json:"provisioningStartTime,omitempty"`

	// ReadyTime is the time when the bot became ready
	// +optional
	ReadyTime *metav1.Time `json:"readyTime,omitempty"`

	// BotID is the unique identifier for the bot on the platform
	BotID string `json:"botID,omitempty"`

	// BotToken is the reference to the Secret containing the bot token
	BotToken string `json:"botToken,omitempty"`

	// WebhookURL is the URL for incoming webhooks
	WebhookURL string `json:"webhookURL,omitempty"`

	// LastError contains information about the last error, if any
	// +optional
	LastError *ErrorInfo `json:"lastError,omitempty"`

	// Metrics for this bot
	// +optional
	Metrics *BotMetrics `json:"metrics,omitempty"`
}

// ChatBotPhase defines the possible phases of a ChatBot
type ChatBotPhase string

const (
	// ChatBotPhasePending indicates the bot is waiting to be processed
	ChatBotPhasePending ChatBotPhase = "Pending"
	// ChatBotPhaseProvisioning indicates the bot is being provisioned
	ChatBotPhaseProvisioning ChatBotPhase = "Provisioning"
	// ChatBotPhaseReady indicates the bot is ready and operational
	ChatBotPhaseReady ChatBotPhase = "Ready"
	// ChatBotPhaseUpdating indicates the bot is being updated
	ChatBotPhaseUpdating ChatBotPhase = "Updating"
	// ChatBotPhaseTerminating indicates the bot is being deleted
	ChatBotPhaseTerminating ChatBotPhase = "Terminating"
	// ChatBotPhaseFailed indicates the bot provisioning failed
	ChatBotPhaseFailed ChatBotPhase = "Failed"
	// ChatBotPhaseDeleted indicates the bot has been deleted
	ChatBotPhaseDeleted ChatBotPhase = "Deleted"
)

// PlatformType defines the supported chat platforms
type PlatformType string

const (
	// PlatformSlack is the Slack platform
	PlatformSlack PlatformType = "slack"
	// PlatformMatrix is the Matrix platform
	PlatformMatrix PlatformType = "matrix"
	// PlatformDiscord is the Discord platform
	PlatformDiscord PlatformType = "discord"
	// PlatformTwilio is the Twilio platform
	PlatformTwilio PlatformType = "twilio"
)

// BotConfigurationSpec defines the configuration for a bot
type BotConfigurationSpec struct {
	// BackendURL is the URL of the backend service that handles bot logic
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Format=uri
	BackendURL string `json:"backendURL"`

	// WebhookPath is the path for incoming webhooks
	// +kubebuilder:default="/webhook"
	WebhookPath string `json:"webhookPath,omitempty"`

	// RateLimit is the maximum messages per minute
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=1000
	// +kubebuilder:default=100
	RateLimit int `json:"rateLimit,omitempty"`

	// TimeoutSeconds is the request timeout in seconds
	// +kubebuilder:validation:Minimum=5
	// +kubebuilder:validation:Maximum=300
	// +kubebuilder:default=30
	TimeoutSeconds int `json:"timeoutSeconds,omitempty"`
}

// CredentialReference defines a reference to credentials
type CredentialReference struct {
	// SecretName is the name of the Kubernetes Secret containing credentials
	// +kubebuilder:validation:Required
	SecretName string `json:"secretName"`

	// SecretNamespace is the namespace of the Secret (defaults to same as ChatBot)
	// +optional
	SecretNamespace string `json:"secretNamespace,omitempty"`
}

// TLSConfig defines TLS configuration
type TLSConfig struct {
	// Enabled indicates whether to use TLS
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// CertManager configuration for automatic certificate provisioning
	// +optional
	CertManager *CertManagerConfig `json:"certManager,omitempty"`
}

// CertManagerConfig defines Cert-Manager configuration
type CertManagerConfig struct {
	// Enabled indicates whether Cert-Manager is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// IssuerName is the name of the Cert-Manager Issuer
	// +kubebuilder:default="letsencrypt-prod"
	IssuerName string `json:"issuerName,omitempty"`

	// IssuerKind is the kind of the Cert-Manager Issuer
	// +kubebuilder:default="ClusterIssuer"
	IssuerKind string `json:"issuerKind,omitempty"`
}

// MonitoringConfig defines monitoring configuration
type MonitoringConfig struct {
	// Enabled indicates whether monitoring is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// Metrics configuration
	// +optional
	Metrics *MetricsConfig `json:"metrics,omitempty"`
}

// MetricsConfig defines metrics configuration
type MetricsConfig struct {
	// Enabled indicates whether metrics are enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// Port is the metrics port
	// +kubebuilder:default=9090
	Port int `json:"port,omitempty"`
}

// ResourceRequirements defines resource requirements
type ResourceRequirements struct {
	// Limits defines the resource limits
	// +optional
	Limits *ResourceLimits `json:"limits,omitempty"`

	// Requests defines the resource requests
	// +optional
	Requests *ResourceRequests `json:"requests,omitempty"`
}

// ResourceLimits defines resource limits
type ResourceLimits struct {
	// CPU limit
	// +kubebuilder:default="500m"
	CPU string `json:"cpu,omitempty"`

	// Memory limit
	// +kubebuilder:default="256Mi"
	Memory string `json:"memory,omitempty"`
}

// ResourceRequests defines resource requests
type ResourceRequests struct {
	// CPU request
	// +kubebuilder:default="100m"
	CPU string `json:"cpu,omitempty"`

	// Memory request
	// +kubebuilder:default="128Mi"
	Memory string `json:"memory,omitempty"`
}

// ErrorInfo defines error information
type ErrorInfo struct {
	// Message is the error message
	Message string `json:"message,omitempty"`

	// Time is the time when the error occurred
	// +optional
	Time *metav1.Time `json:"time,omitempty"`

	// Count is the number of times this error has occurred
	// +kubebuilder:default=0
	Count int `json:"count,omitempty"`
}

// BotMetrics defines metrics for a bot
type BotMetrics struct {
	// ProvisioningTimeSeconds is the time taken to provision the bot
	ProvisioningTimeSeconds float64 `json:"provisioningTimeSeconds,omitempty"`

	// MessagesProcessed is the total messages processed
	// +kubebuilder:default=0
	MessagesProcessed int64 `json:"messagesProcessed,omitempty"`

	// Errors is the total errors encountered
	// +kubebuilder:default=0
	Errors int64 `json:"errors,omitempty"`

	// LastMessageTime is the time of the last processed message
	// +optional
	LastMessageTime *metav1.Time `json:"lastMessageTime,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// ChatBotList contains a list of ChatBot resources
type ChatBotList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []ChatBot `json:"items"`
}

// GetChatBotPhase returns the current phase of the ChatBot
func (c *ChatBot) GetChatBotPhase() ChatBotPhase {
	return c.Status.Phase
}

// SetChatBotPhase sets the phase of the ChatBot and updates the transition time
func (c *ChatBot) SetChatBotPhase(phase ChatBotPhase, message, reason string) {
	if c.Status.Phase != phase {
		c.Status.Phase = phase
		c.Status.Message = message
		c.Status.Reason = reason
		now := metav1.Now()
		c.Status.LastTransitionTime = &now
		
		// Update specific timestamps based on phase
		switch phase {
		case ChatBotPhaseProvisioning:
			c.Status.ProvisioningStartTime = &now
		case ChatBotPhaseReady:
			c.Status.ReadyTime = &now
		}
	}
}

// IsReady returns true if the ChatBot is in Ready phase
func (c *ChatBot) IsReady() bool {
	return c.Status.Phase == ChatBotPhaseReady
}

// IsFailed returns true if the ChatBot is in Failed phase
func (c *ChatBot) IsFailed() bool {
	return c.Status.Phase == ChatBotPhaseFailed
}

// IsTerminating returns true if the ChatBot is in Terminating phase
func (c *ChatBot) IsTerminating() bool {
	return c.Status.Phase == ChatBotPhaseTerminating
}

// AddError records an error in the ChatBot status
func (c *ChatBot) AddError(message string) {
	now := metav1.Now()
	if c.Status.LastError == nil {
		c.Status.LastError = &ErrorInfo{}
	}
	
	c.Status.LastError.Message = message
	c.Status.LastError.Time = &now
	c.Status.LastError.Count++
}

// ClearError clears the last error from the ChatBot status
func (c *ChatBot) ClearError() {
	c.Status.LastError = nil
}

// UpdateMetrics updates the metrics for the ChatBot
func (c *ChatBot) UpdateMetrics(provisioningTimeSeconds float64, messagesProcessed, errors int64) {
	if c.Status.Metrics == nil {
		c.Status.Metrics = &BotMetrics{}
	}
	
	c.Status.Metrics.ProvisioningTimeSeconds = provisioningTimeSeconds
	c.Status.Metrics.MessagesProcessed = messagesProcessed
	c.Status.Metrics.Errors = errors
}

// IncrementMessagesProcessed increments the messages processed counter
func (c *ChatBot) IncrementMessagesProcessed() {
	if c.Status.Metrics == nil {
		c.Status.Metrics = &BotMetrics{}
	}
	c.Status.Metrics.MessagesProcessed++
	c.Status.Metrics.LastMessageTime = &metav1.Time{Time: metav1.Now().Time}
}

// IncrementErrors increments the errors counter
func (c *ChatBot) IncrementErrors() {
	if c.Status.Metrics == nil {
		c.Status.Metrics = &BotMetrics{}
	}
	c.Status.Metrics.Errors++
}
