// BotCredential API Types
// ==========================
// Defines the BotCredential resource types for the ChatBot Operator
// References: docs/omen/strategy.json (Application Goal AG001, Security Goal AG004)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-004)
// References: config/crd/bases/chatbotoperator.io_botcredentials.yaml (CRD definition)
// References: features/chatbot.feature (BDD scenarios)

package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// BotCredential defines credentials for chat bot authentication
type BotCredential struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   BotCredentialSpec   `json:"spec,omitempty"`
	Status BotCredentialStatus `json:"status,omitempty"`
}

// BotCredentialSpec defines the desired state of a BotCredential
type BotCredentialSpec struct {
	// ChatBotRef is the reference to the ChatBot this credential belongs to
	// +kubebuilder:validation:Required
	ChatBotRef ChatBotReference `json:"chatBotRef"`

	// CredentialType is the type of credential
	// +kubebuilder:validation:Enum=apiToken;oauthToken;webhookSecret;apiKey;bearerToken;basicAuth;certificate
	// +kubebuilder:validation:Required
	CredentialType CredentialType `json:"credentialType"`

	// Name is the name of this credential
	// +kubebuilder:validation:MinLength=1
	// +kubebuilder:validation:MaxLength=63
	// +kubebuilder:validation:Pattern=^[a-z0-9]([-a-z0-9]*[a-z0-9])?$
	Name string `json:"name"`

	// Description is the description of this credential
	// +kubebuilder:validation:MaxLength=500
	Description string `json:"description,omitempty"`

	// Value is the credential value (will be stored in a Secret)
	// +kubebuilder:validation:Format=password
	Value string `json:"value,omitempty"`

	// ValueFrom is the reference to existing Secret for the value
	// +optional
	ValueFrom *SecretKeySelector `json:"valueFrom,omitempty"`

	// Platform is the platform this credential is for
	// +kubebuilder:validation:Enum=slack;matrix;discord;twilio;generic
	Platform PlatformType `json:"platform,omitempty"`

	// Scope is the scope of this credential
	// +kubebuilder:validation:Enum=bot;user;workspace;organization;global
	// +kubebuilder:default="bot"
	Scope CredentialScope `json:"scope,omitempty"`

	// Permissions are the list of permissions granted by this credential
	// +optional
	Permissions []string `json:"permissions,omitempty"`

	// ExpiresAt is the expiration time for this credential
	// +optional
	ExpiresAt *metav1.Time `json:"expiresAt,omitempty"`

	// Rotation configuration for this credential
	// +optional
	Rotation *RotationConfig `json:"rotation,omitempty"`

	// Encryption configuration for the credential
	// +optional
	Encryption *EncryptionConfig `json:"encryption,omitempty"`

	// Audit configuration for this credential
	// +optional
	Audit *AuditConfig `json:"audit,omitempty"`

	// Labels for the credential resource
	// +optional
	Labels map[string]string `json:"labels,omitempty"`

	// Annotations for the credential resource
	// +optional
	Annotations map[string]string `json:"annotations,omitempty"`
}

// BotCredentialStatus defines the observed state of a BotCredential
type BotCredentialStatus struct {
	// Phase is the current phase
	// +kubebuilder:validation:Enum=Pending;Creating;Ready;Rotating;Expired;Revoked;Failed;Deleted
	Phase BotCredentialPhase `json:"phase,omitempty"`

	// Message is a human-readable message about the current status
	Message string `json:"message,omitempty"`

	// Reason is a machine-readable reason for the current status
	Reason string `json:"reason,omitempty"`

	// LastTransitionTime is the time of the last status transition
	// +optional
	LastTransitionTime *metav1.Time `json:"lastTransitionTime,omitempty"`

	// SecretName is the name of the Kubernetes Secret storing this credential
	SecretName string `json:"secretName,omitempty"`

	// SecretNamespace is the namespace of the Secret
	SecretNamespace string `json:"secretNamespace,omitempty"`

	// LastRotatedTime is the time when the credential was last rotated
	// +optional
	LastRotatedTime *metav1.Time `json:"lastRotatedTime,omitempty"`

	// NextRotationTime is the time when the next rotation is scheduled
	// +optional
	NextRotationTime *metav1.Time `json:"nextRotationTime,omitempty"`

	// RotationCount is the number of times this credential has been rotated
	// +kubebuilder:default=0
	RotationCount int `json:"rotationCount,omitempty"`

	// LastAccessedTime is the time when the credential was last accessed
	// +optional
	LastAccessedTime *metav1.Time `json:"lastAccessedTime,omitempty"`

	// AccessCount is the number of times this credential has been accessed
	// +kubebuilder:default=0
	AccessCount int64 `json:"accessCount,omitempty"`

	// LastError contains information about the last error, if any
	// +optional
	LastError *ErrorInfo `json:"lastError,omitempty"`

	// Metrics for this credential
	// +optional
	Metrics *CredentialMetrics `json:"metrics,omitempty"`
}

// BotCredentialPhase defines the possible phases of a BotCredential
type BotCredentialPhase string

const (
	// BotCredentialPhasePending indicates the credential is waiting to be created
	BotCredentialPhasePending BotCredentialPhase = "Pending"
	// BotCredentialPhaseCreating indicates the credential is being created
	BotCredentialPhaseCreating BotCredentialPhase = "Creating"
	// BotCredentialPhaseReady indicates the credential is ready
	BotCredentialPhaseReady BotCredentialPhase = "Ready"
	// BotCredentialPhaseRotating indicates the credential is being rotated
	BotCredentialPhaseRotating BotCredentialPhase = "Rotating"
	// BotCredentialPhaseExpired indicates the credential has expired
	BotCredentialPhaseExpired BotCredentialPhase = "Expired"
	// BotCredentialPhaseRevoked indicates the credential has been revoked
	BotCredentialPhaseRevoked BotCredentialPhase = "Revoked"
	// BotCredentialPhaseFailed indicates the credential creation failed
	BotCredentialPhaseFailed BotCredentialPhase = "Failed"
	// BotCredentialPhaseDeleted indicates the credential has been deleted
	BotCredentialPhaseDeleted BotCredentialPhase = "Deleted"
)

// CredentialType defines the type of credential
type CredentialType string

const (
	// CredentialTypeAPIToken is an API token
	CredentialTypeAPIToken CredentialType = "apiToken"
	// CredentialTypeOAuthToken is an OAuth token
	CredentialTypeOAuthToken CredentialType = "oauthToken"
	// CredentialTypeWebhookSecret is a webhook secret
	CredentialTypeWebhookSecret CredentialType = "webhookSecret"
	// CredentialTypeAPIKey is an API key
	CredentialTypeAPIKey CredentialType = "apiKey"
	// CredentialTypeBearerToken is a bearer token
	CredentialTypeBearerToken CredentialType = "bearerToken"
	// CredentialTypeBasicAuth is basic auth credentials
	CredentialTypeBasicAuth CredentialType = "basicAuth"
	// CredentialTypeCertificate is a certificate
	CredentialTypeCertificate CredentialType = "certificate"
)

// CredentialScope defines the scope of a credential
type CredentialScope string

const (
	// CredentialScopeBot is bot-level scope
	CredentialScopeBot CredentialScope = "bot"
	// CredentialScopeUser is user-level scope
	CredentialScopeUser CredentialScope = "user"
	// CredentialScopeWorkspace is workspace-level scope
	CredentialScopeWorkspace CredentialScope = "workspace"
	// CredentialScopeOrganization is organization-level scope
	CredentialScopeOrganization CredentialScope = "organization"
	// CredentialScopeGlobal is global scope
	CredentialScopeGlobal CredentialScope = "global"
)

// RotationConfig defines credential rotation configuration
type RotationConfig struct {
	// Enabled indicates whether automatic rotation is enabled
	// +kubebuilder:default=false
	Enabled bool `json:"enabled,omitempty"`

	// Schedule is the rotation schedule in cron format
	Schedule string `json:"schedule,omitempty"`

	// RotationStrategy is the strategy for credential rotation
	// +kubebuilder:validation:Enum=immediate;graceful;rolling
	// +kubebuilder:default="graceful"
	RotationStrategy RotationStrategy `json:"rotationStrategy,omitempty"`

	// GracePeriodHours is the grace period in hours for old credentials
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=720
	// +kubebuilder:default=24
	GracePeriodHours int `json:"gracePeriodHours,omitempty"`

	// MaxRetries is the maximum number of rotation retries
	// +kubebuilder:validation:Minimum=0
	// +kubebuilder:validation:Maximum=10
	// +kubebuilder:default=3
	MaxRetries int `json:"maxRetries,omitempty"`
}

// RotationStrategy defines the strategy for credential rotation
type RotationStrategy string

const (
	// RotationStrategyImmediate is immediate rotation
	RotationStrategyImmediate RotationStrategy = "immediate"
	// RotationStrategyGraceful is graceful rotation
	RotationStrategyGraceful RotationStrategy = "graceful"
	// RotationStrategyRolling is rolling rotation
	RotationStrategyRolling RotationStrategy = "rolling"
)

// EncryptionConfig defines encryption configuration for a credential
type EncryptionConfig struct {
	// Enabled indicates whether the credential is encrypted at rest
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// Algorithm is the encryption algorithm
	// +kubebuilder:validation:Enum=AES-256-GCM;AES-256-CBC;RSA-2048;RSA-4096
	// +kubebuilder:default="AES-256-GCM"
	Algorithm EncryptionAlgorithm `json:"algorithm,omitempty"`

	// KeyReference is the reference to the encryption key
	// +optional
	KeyReference *SecretKeySelector `json:"keyReference,omitempty"`
}

// EncryptionAlgorithm defines the encryption algorithm
type EncryptionAlgorithm string

const (
	// EncryptionAlgorithmAES256GCM is AES-256-GCM
	EncryptionAlgorithmAES256GCM EncryptionAlgorithm = "AES-256-GCM"
	// EncryptionAlgorithmAES256CBC is AES-256-CBC
	EncryptionAlgorithmAES256CBC EncryptionAlgorithm = "AES-256-CBC"
	// EncryptionAlgorithmRSA2048 is RSA-2048
	EncryptionAlgorithmRSA2048 EncryptionAlgorithm = "RSA-2048"
	// EncryptionAlgorithmRSA4096 is RSA-4096
	EncryptionAlgorithmRSA4096 EncryptionAlgorithm = "RSA-4096"
)

// AuditConfig defines audit configuration for a credential
type AuditConfig struct {
	// Enabled indicates whether audit is enabled
	// +kubebuilder:default=true
	Enabled bool `json:"enabled,omitempty"`

	// LogAccess indicates whether to log credential access
	// +kubebuilder:default=true
	LogAccess bool `json:"logAccess,omitempty"`

	// LogChanges indicates whether to log credential changes
	// +kubebuilder:default=true
	LogChanges bool `json:"logChanges,omitempty"`
}

// CredentialMetrics defines metrics for a credential
type CredentialMetrics struct {
	// AgeDays is the age of the credential in days
	AgeDays float64 `json:"ageDays,omitempty"`

	// DaysUntilExpiration is the days until credential expires
	DaysUntilExpiration int `json:"daysUntilExpiration,omitempty"`

	// IsExpiringSoon indicates whether the credential is expiring soon
	IsExpiringSoon bool `json:"isExpiringSoon,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// BotCredentialList contains a list of BotCredential resources
type BotCredentialList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []BotCredential `json:"items"`
}

// GetBotCredentialPhase returns the current phase of the BotCredential
func (bc *BotCredential) GetBotCredentialPhase() BotCredentialPhase {
	return bc.Status.Phase
}

// SetBotCredentialPhase sets the phase of the BotCredential and updates the transition time
func (bc *BotCredential) SetBotCredentialPhase(phase BotCredentialPhase, message, reason string) {
	if bc.Status.Phase != phase {
		bc.Status.Phase = phase
		bc.Status.Message = message
		bc.Status.Reason = reason
		now := metav1.Now()
		bc.Status.LastTransitionTime = &now
	}
}

// IsReady returns true if the BotCredential is in Ready phase
func (bc *BotCredential) IsReady() bool {
	return bc.Status.Phase == BotCredentialPhaseReady
}

// IsFailed returns true if the BotCredential is in Failed phase
func (bc *BotCredential) IsFailed() bool {
	return bc.Status.Phase == BotCredentialPhaseFailed
}

// IsExpired returns true if the BotCredential is in Expired phase
func (bc *BotCredential) IsExpired() bool {
	return bc.Status.Phase == BotCredentialPhaseExpired
}

// SetSecretInfo sets the Secret information
func (bc *BotCredential) SetSecretInfo(name, namespace string) {
	bc.Status.SecretName = name
	bc.Status.SecretNamespace = namespace
}

// SetLastRotatedTime sets the last rotated time
func (bc *BotCredential) SetLastRotatedTime(t *metav1.Time) {
	bc.Status.LastRotatedTime = t
}

// SetNextRotationTime sets the next rotation time
func (bc *BotCredential) SetNextRotationTime(t *metav1.Time) {
	bc.Status.NextRotationTime = t
}

// IncrementRotationCount increments the rotation count
func (bc *BotCredential) IncrementRotationCount() {
	bc.Status.RotationCount++
}

// SetLastAccessedTime sets the last accessed time
func (bc *BotCredential) SetLastAccessedTime(t *metav1.Time) {
	bc.Status.LastAccessedTime = t
}

// IncrementAccessCount increments the access count
func (bc *BotCredential) IncrementAccessCount() {
	bc.Status.AccessCount++
}

// AddError records an error in the BotCredential status
func (bc *BotCredential) AddError(message string) {
	now := metav1.Now()
	if bc.Status.LastError == nil {
		bc.Status.LastError = &ErrorInfo{}
	}
	
	bc.Status.LastError.Message = message
	bc.Status.LastError.Time = &now
	bc.Status.LastError.Count++
}

// ClearError clears the last error from the BotCredential status
func (bc *BotCredential) ClearError() {
	bc.Status.LastError = nil
}

// UpdateMetrics updates the metrics for the BotCredential
func (bc *BotCredential) UpdateMetrics(ageDays float64, daysUntilExpiration int, isExpiringSoon bool) {
	if bc.Status.Metrics == nil {
		bc.Status.Metrics = &CredentialMetrics{}
	}
	
	bc.Status.Metrics.AgeDays = ageDays
	bc.Status.Metrics.DaysUntilExpiration = daysUntilExpiration
	bc.Status.Metrics.IsExpiringSoon = isExpiringSoon
}
