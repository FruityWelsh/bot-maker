// BotPlatform API Types
// =======================
// Defines the BotPlatform resource types for the ChatBot Operator
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-003)
// References: config/crd/bases/chatbotoperator.io_botplatforms.yaml (CRD definition)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// BotPlatform defines platform-specific configuration and provisioning settings
type BotPlatform struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   BotPlatformSpec   `json:"spec,omitempty"`
	Status BotPlatformStatus `json:"status,omitempty"`
}

// BotPlatformSpec defines the desired state of a BotPlatform
type BotPlatformSpec struct {
	// PlatformType is the type of chat platform
	// +kubebuilder:validation:Enum=slack;matrix;discord;twilio
	// +kubebuilder:validation:Required
	PlatformType PlatformType `json:"platformType"`

	// Name is the name of this platform configuration
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=63
	// +kubebuilder:validation:Pattern=^[a-z0-9]([-a-z0-9]*[a-z0-9])?$
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// DisplayName is the user-friendly display name
	// +kubebuilder:validation:MaxLength=100
	DisplayName string `json:"displayName,omitempty"`

	// Description is the description of this platform configuration
	// +kubebuilder:validation:MaxLength=500
	Description string `json:"description,omitempty"`

	// API configuration for the platform
	// +kubebuilder:validation:Required
	API *APIConfig `json:"api"`

	// Authentication configuration
	// +kubebuilder:validation:Required
	Authentication *AuthenticationConfig `json:"authentication"`

	// Provisioning configuration for this platform
	// +kubebuilder:validation:Required
	Provisioning *ProvisioningConfig `json:"provisioning"`

	// Webhook configuration
	// +optional
	Webhook *WebhookConfig `json:"webhook,omitempty"`

	// Monitoring configuration
	// +optional
	Monitoring *MonitoringConfig `json:"monitoring,omitempty"`

	// Labels for the platform resource
	// +optional
	Labels map[string]string `json:"labels,omitempty"`

	// Annotations for the platform resource
	// +optional
	Annotations map[string]string `json:"annotations,omitempty"`
}

// BotPlatformStatus defines the observed state of a BotPlatform
type BotPlatformStatus struct {
	// Phase is the current phase
	// +kubebuilder:validation:Enum=Pending;Configuring;Ready;Failed;Deleted
	Phase BotPlatformPhase `json:"phase,omitempty"`

	// Message is a human-readable message about the current status
	Message string `json:"message,omitempty"`

	// Reason is a machine-readable reason for the current status
	Reason string `json:"reason,omitempty"`

	// LastTransitionTime is the time of the last status transition
	// +optional
	LastTransitionTime *metav1.Time `json:"lastTransitionTime,omitempty"`

	// ProvisionerStatus is the status of the provisioner
	// +kubebuilder:validation:Enum=NotReady;Ready;Failed
	ProvisionerStatus ProvisionerStatus `json:"provisionerStatus,omitempty"`

	// APIStatus is the status of API connectivity
	// +kubebuilder:validation:Enum=NotConnected;Connected;Failed
	APIStatus APIStatus `json:"apiStatus,omitempty"`

	// LastError contains information about the last error, if any
	// +optional
	LastError *ErrorInfo `json:"lastError,omitempty"`

	// Metrics for this platform
	// +optional
	Metrics *PlatformMetrics `json:"metrics,omitempty"`
}

// BotPlatformPhase defines the possible phases of a BotPlatform
type BotPlatformPhase string

const (
	// BotPlatformPhasePending indicates the platform is waiting to be configured
	BotPlatformPhasePending BotPlatformPhase = "Pending"
	// BotPlatformPhaseConfiguring indicates the platform is being configured
	BotPlatformPhaseConfiguring BotPlatformPhase = "Configuring"
	// BotPlatformPhaseReady indicates the platform is ready
	BotPlatformPhaseReady BotPlatformPhase = "Ready"
	// BotPlatformPhaseFailed indicates the platform configuration failed
	BotPlatformPhaseFailed BotPlatformPhase = "Failed"
	// BotPlatformPhaseDeleted indicates the platform has been deleted
	BotPlatformPhaseDeleted BotPlatformPhase = "Deleted"
)

// ProvisionerStatus defines the status of the provisioner
type ProvisionerStatus string

const (
	// ProvisionerStatusNotReady indicates the provisioner is not ready
	ProvisionerStatusNotReady ProvisionerStatus = "NotReady"
	// ProvisionerStatusReady indicates the provisioner is ready
	ProvisionerStatusReady ProvisionerStatus = "Ready"
	// ProvisionerStatusFailed indicates the provisioner has failed
	ProvisionerStatusFailed ProvisionerStatus = "Failed"
)

// APIStatus defines the status of API connectivity
type APIStatus string

const (
	// APIStatusNotConnected indicates the API is not connected
	APIStatusNotConnected APIStatus = "NotConnected"
	// APIStatusConnected indicates the API is connected
	APIStatusConnected APIStatus = "Connected"
	// APIStatusFailed indicates the API connection has failed
	APIStatusFailed APIStatus = "Failed"
)

// APIConfig defines API configuration for a platform
type APIConfig struct {
	// BaseURL is the base URL for the platform API
	// +kubebuilder:validation:Required
	// +kubebuilder:validation:Format=uri
	BaseURL string `json:"baseURL"`

	// Version is the API version to use
	// +kubebuilder:default="v1"
	Version string `json:"version,omitempty"`

	// RateLimit is the API rate limit per minute
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=1000
	// +kubebuilder:default=60
	RateLimit int `json:"rateLimit,omitempty"`

	// TimeoutSeconds is the API request timeout
	// +kubebuilder:validation:Minimum=5
	// +kubebuilder:validation:Maximum=300
	// +kubebuilder:default=30
	TimeoutSeconds int `json:"timeoutSeconds,omitempty"`
}

// AuthenticationConfig defines authentication configuration
type AuthenticationConfig struct {
	// Method is the authentication method
	// +kubebuilder:validation:Enum=oauth2;apiKey;bearerToken;basicAuth
	// +kubebuilder:validation:Required
	Method AuthenticationMethod `json:"method"`

	// OAuth2 configuration
	// +optional
	OAuth2 *OAuth2Config `json:"oauth2,omitempty"`

	// APIKey configuration
	// +optional
	APIKey *APIKeyConfig `json:"apiKey,omitempty"`

	// BearerToken configuration
	// +optional
	BearerToken *BearerTokenConfig `json:"bearerToken,omitempty"`

	// BasicAuth configuration
	// +optional
	BasicAuth *BasicAuthConfig `json:"basicAuth,omitempty"`
}

// AuthenticationMethod defines the authentication method
type AuthenticationMethod string

const (
	// AuthenticationMethodOAuth2 is OAuth2 authentication
	AuthenticationMethodOAuth2 AuthenticationMethod = "oauth2"
	// AuthenticationMethodAPIKey is API key authentication
	AuthenticationMethodAPIKey AuthenticationMethod = "apiKey"
	// AuthenticationMethodBearerToken is bearer token authentication
	AuthenticationMethodBearerToken AuthenticationMethod = "bearerToken"
	// AuthenticationMethodBasicAuth is basic authentication
	AuthenticationMethodBasicAuth AuthenticationMethod = "basicAuth"
)

// OAuth2Config defines OAuth2 configuration
type OAuth2Config struct {
	// ClientID is the OAuth2 client ID
	ClientID string `json:"clientID,omitempty"`

	// ClientSecret is the reference to Secret containing client secret
	ClientSecret string `json:"clientSecret,omitempty"`

	// TokenURL is the OAuth2 token endpoint
	// +kubebuilder:validation:Format=uri
	TokenURL string `json:"tokenURL,omitempty"`

	// Scopes are the required OAuth2 scopes
	Scopes []string `json:"scopes,omitempty"`
}

// APIKeyConfig defines API key configuration
type APIKeyConfig struct {
	// HeaderName is the HTTP header name for API key
	// +kubebuilder:default="X-API-Key"
	HeaderName string `json:"headerName,omitempty"`

	// SecretName is the reference to Secret containing API key
	SecretName string `json:"secretName,omitempty"`
}

// BearerTokenConfig defines bearer token configuration
type BearerTokenConfig struct {
	// SecretName is the reference to Secret containing bearer token
	SecretName string `json:"secretName,omitempty"`
}

// BasicAuthConfig defines basic auth configuration
type BasicAuthConfig struct {
	// Username for basic auth
	Username string `json:"username,omitempty"`

	// PasswordSecretName is the reference to Secret containing password
	PasswordSecretName string `json:"passwordSecretName,omitempty"`
}

// ProvisioningConfig defines provisioning configuration for a platform
type ProvisioningConfig struct {
	// ProvisionerImage is the container image for the provisioner
	// +kubebuilder:validation:Required
	ProvisionerImage string `json:"provisionerImage"`

	// ProvisionerCommand is the command to run the provisioner
	// +kubebuilder:default=["/provisioner"]
	ProvisionerCommand []string `json:"provisionerCommand,omitempty"`

	// ProvisionerArgs are the arguments for the provisioner
	// +optional
	ProvisionerArgs []string `json:"provisionerArgs,omitempty"`

	// Environment variables for the provisioner
	// +optional
	Environment []EnvVar `json:"environment,omitempty"`

	// Resource requirements for provisioner
	// +optional
	Resources *ProvisionerResources `json:"resources,omitempty"`

	// TimeoutSeconds is the provisioning timeout
	// +kubebuilder:validation:Minimum=30
	// +kubebuilder:validation:Maximum=3600
	// +kubebuilder:default=300
	TimeoutSeconds int `json:"timeoutSeconds,omitempty"`
}

// EnvVar defines an environment variable
type EnvVar struct {
	// Name is the name of the environment variable
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Value is the value of the environment variable
	// +optional
	Value string `json:"value,omitempty"`

	// ValueFrom is the reference to a Secret for the value
	// +optional
	ValueFrom *SecretKeySelector `json:"valueFrom,omitempty"`
}

// SecretKeySelector defines a reference to a key in a Secret
type SecretKeySelector struct {
	// Name is the name of the Secret
	// +kubebuilder:validation:Required
	Name string `json:"name"`

	// Key is the key in the Secret
	// +kubebuilder:validation:Required
	Key string `json:"key"`

	// Namespace is the namespace of the Secret
	// +optional
	Namespace string `json:"namespace,omitempty"`
}

// ProvisionerResources defines resource requirements for provisioner
type ProvisionerResources struct {
	// Limits defines the resource limits
	// +optional
	Limits *ResourceLimits `json:"limits,omitempty"`

	// Requests defines the resource requests
	// +optional
	Requests *ResourceRequests `json:"requests,omitempty"`
}

// WebhookConfig defines webhook configuration
type WebhookConfig struct {
	// Enabled indicates whether webhooks are enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// PathPrefix is the prefix for webhook paths
	// +kubebuilder:default="/webhook"
	PathPrefix string `json:"pathPrefix,omitempty"`

	// Port is the port for webhook server
	// +kubebuilder:validation:Minimum=1024
	// +kubebuilder:validation:Maximum=65535
	// +kubebuilder:default=8080
	Port int `json:"port,omitempty"`

	// TLS configuration for webhooks
	// +optional
	TLS *WebhookTLSConfig `json:"tls,omitempty"`
}

// WebhookTLSConfig defines TLS configuration for webhooks
type WebhookTLSConfig struct {
	// Enabled indicates whether TLS is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// CertManager configuration for automatic certificate provisioning
	// +optional
	CertManager *CertManagerConfig `json:"certManager,omitempty"`
}

// PlatformMetrics defines metrics for a platform
type PlatformMetrics struct {
	// APICalls is the total number of API calls
	// +kubebuilder:default=0
	APICalls int64 `json:"apiCalls,omitempty"`

	// Errors is the total number of errors
	// +kubebuilder:default=0
	Errors int64 `json:"errors,omitempty"`

	// LastApiCallTime is the time of the last API call
	// +optional
	LastApiCallTime *metav1.Time `json:"lastApiCallTime,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// BotPlatformList contains a list of BotPlatform resources
type BotPlatformList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []BotPlatform `json:"items"`
}

// GetBotPlatformPhase returns the current phase of the BotPlatform
func (bp *BotPlatform) GetBotPlatformPhase() BotPlatformPhase {
	return bp.Status.Phase
}

// SetBotPlatformPhase sets the phase of the BotPlatform and updates the transition time
func (bp *BotPlatform) SetBotPlatformPhase(phase BotPlatformPhase, message, reason string) {
	if bp.Status.Phase != phase {
		bp.Status.Phase = phase
		bp.Status.Message = message
		bp.Status.Reason = reason
		now := metav1.Now()
		bp.Status.LastTransitionTime = &now
	}
}

// IsReady returns true if the BotPlatform is in Ready phase
func (bp *BotPlatform) IsReady() bool {
	return bp.Status.Phase == BotPlatformPhaseReady
}

// IsFailed returns true if the BotPlatform is in Failed phase
func (bp *BotPlatform) IsFailed() bool {
	return bp.Status.Phase == BotPlatformPhaseFailed
}

// SetProvisionerStatus sets the provisioner status
func (bp *BotPlatform) SetProvisionerStatus(status ProvisionerStatus) {
	bp.Status.ProvisionerStatus = status
}

// SetAPIStatus sets the API status
func (bp *BotPlatform) SetAPIStatus(status APIStatus) {
	bp.Status.APIStatus = status
}

// AddError records an error in the BotPlatform status
func (bp *BotPlatform) AddError(message string) {
	now := metav1.Now()
	if bp.Status.LastError == nil {
		bp.Status.LastError = &ErrorInfo{}
	}
	
	bp.Status.LastError.Message = message
	bp.Status.LastError.Time = &now
	bp.Status.LastError.Count++
}

// ClearError clears the last error from the BotPlatform status
func (bp *BotPlatform) ClearError() {
	bp.Status.LastError = nil
}

// UpdateMetrics updates the metrics for the BotPlatform
func (bp *BotPlatform) UpdateMetrics(apiCalls, errors int64) {
	if bp.Status.Metrics == nil {
		bp.Status.Metrics = &PlatformMetrics{}
	}
	
	bp.Status.Metrics.APICalls = apiCalls
	bp.Status.Metrics.Errors = errors
	bp.Status.Metrics.LastApiCallTime = &metav1.Time{Time: metav1.Now().Time}
}

// IncrementAPICalls increments the API calls counter
func (bp *BotPlatform) IncrementAPICalls() {
	if bp.Status.Metrics == nil {
		bp.Status.Metrics = &PlatformMetrics{}
	}
	bp.Status.Metrics.APICalls++
	bp.Status.Metrics.LastApiCallTime = &metav1.Time{Time: metav1.Now().Time}
}

// IncrementErrors increments the errors counter
func (bp *BotPlatform) IncrementErrors() {
	if bp.Status.Metrics == nil {
		bp.Status.Metrics = &PlatformMetrics{}
	}
	bp.Status.Metrics.Errors++
}
