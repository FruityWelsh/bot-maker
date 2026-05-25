// ChatBot Controller
// ====================
// Controller for managing ChatBot resources
// References: docs/omen/strategy.json (Application Goal AG001)
// References: docs/adr/architecture-decisions.md (ADR-001, ADR-002)
// References: api/v1alpha1/chatbot_types.go (API Types)
// References: features/chatbot.feature (BDD scenarios)
// References: features/operator_controller.feature (Controller BDD scenarios)

package controller

import (
	"context"
	"fmt"
	"reflect"
	"time"

	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/controller"
	"sigs.k8s.io/controller-runtime/pkg/handler"
	"sigs.k8s.io/controller-runtime/pkg/log"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
	"sigs.k8s.io/controller-runtime/pkg/source"

	chatbotv1alpha1 "github.com/FruityWelsh/bot-maker/api/v1alpha1"
)

// ChatBotReconciler reconciles a ChatBot object
// +kubebuilder:rbac:groups=chatbotoperator.io,resources=chatbots,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=chatbotoperator.io,resources=chatbots/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=chatbotoperator.io,resources=chatbots/finalizers,verbs=update
// +kubebuilder:rbac:groups="",resources=secrets,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups="",resources=services,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups="",resources=deployments,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups="",resources=configmaps,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=secrets,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=configmaps,verbs=get;list;watch;create;update;patch;delete

type ChatBotReconciler struct {
	client.Client
	Log    logr.Logger
	Scheme *runtime.Scheme
}

// NewChatBotReconciler creates a new ChatBotReconciler
func NewChatBotReconciler(mgr manager.Manager) *ChatBotReconciler {
	return &ChatBotReconciler{
		Client: mgr.GetClient(),
		Log:    ctrl.Log.WithName("controllers").WithName("ChatBot"),
		Scheme: mgr.GetScheme(),
	}
}

// +kubebuilder:rbac:groups=chatbotoperator.io,resources=botplatforms,verbs=get;list;watch
// +kubebuilder:rbac:groups=chatbotoperator.io,resources=botconfigurations,verbs=get;list;watch
// +kubebuilder:rbac:groups=chatbotoperator.io,resources=botcredentials,verbs=get;list;watch

// Reconcile is the main reconciliation loop for ChatBot resources
func (r *ChatBotReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := r.Log.WithValues("chatbot", req.NamespacedName)

	// Fetch the ChatBot instance
	chatBot := &chatbotv1alpha1.ChatBot{}
	err := r.Get(ctx, req.NamespacedName, chatBot)
	if err != nil {
		if errors.IsNotFound(err) {
			// Request object not found, could have been deleted after reconcile request
			// Owned objects are automatically garbage collected. For additional cleanup logic use finalizers
			log.Info("ChatBot resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		// Error reading the object - requeue the request
		log.Error(err, "Failed to get ChatBot")
		return ctrl.Result{}, fmt.Errorf("failed to get ChatBot: %w", err)
	}

	// Check if the ChatBot is being deleted
	if !chatBot.ObjectMeta.DeletionTimestamp.IsZero() {
		return r.reconcileDelete(ctx, chatBot, log)
	}

	// Reconcile the ChatBot
	return r.reconcileNormal(ctx, chatBot, log)
}

// reconcileNormal handles normal reconciliation (not deletion)
func (r *ChatBotReconciler) reconcileNormal(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Starting reconciliation for ChatBot", "phase", chatBot.Status.Phase)

	// Validate the ChatBot
	if err := r.validateChatBot(chatBot); err != nil {
		log.Error(err, "Validation failed")
		chatBot.AddError(err.Error())
		chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhaseFailed, "Validation failed", "InvalidSpec")
		if err := r.Status().Update(ctx, chatBot); err != nil {
			log.Error(err, "Failed to update status after validation error")
			return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
		}
		return ctrl.Result{}, nil
	}

	// Handle different phases
	switch chatBot.Status.Phase {
	case "", chatbotv1alpha1.ChatBotPhasePending:
		return r.handlePending(ctx, chatBot, log)
	case chatbotv1alpha1.ChatBotPhaseProvisioning:
		return r.handleProvisioning(ctx, chatBot, log)
	case chatbotv1alpha1.ChatBotPhaseReady:
		return r.handleReady(ctx, chatBot, log)
	case chatbotv1alpha1.ChatBotPhaseUpdating:
		return r.handleUpdating(ctx, chatBot, log)
	case chatbotv1alpha1.ChatBotPhaseTerminating:
		return r.handleTerminating(ctx, chatBot, log)
	case chatbotv1alpha1.ChatBotPhaseFailed:
		return r.handleFailed(ctx, chatBot, log)
	default:
		log.Info("Unknown phase, resetting to Pending", "phase", chatBot.Status.Phase)
		chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhasePending, "Resetting to pending", "UnknownPhase")
		if err := r.Status().Update(ctx, chatBot); err != nil {
			return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
		}
		return ctrl.Result{Requeue: true}, nil
	}
}

// reconcileDelete handles deletion reconciliation
func (r *ChatBotReconciler) reconcileDelete(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Starting deletion reconciliation for ChatBot")

	// Check if finalizer exists
	if !contains(chatBot.GetFinalizers(), chatbotFinalizer) {
		log.Info("No finalizer found, deletion already handled")
		return ctrl.Result{}, nil
	}

	// Perform cleanup
	if err := r.cleanupChatBot(ctx, chatBot, log); err != nil {
		log.Error(err, "Failed to cleanup ChatBot resources")
		return ctrl.Result{}, fmt.Errorf("cleanup failed: %w", err)
	}

	// Remove finalizer
	chatBot.SetFinalizers(remove(chatBot.GetFinalizers(), chatbotFinalizer))
	if err := r.Update(ctx, chatBot); err != nil {
		log.Error(err, "Failed to remove finalizer")
		return ctrl.Result{}, fmt.Errorf("failed to remove finalizer: %w", err)
	}

	log.Info("ChatBot deletion completed")
	return ctrl.Result{}, nil
}

// handlePending handles the Pending phase
func (r *ChatBotReconciler) handlePending(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Handling Pending phase")

	// Set phase to Provisioning
	chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhaseProvisioning, "Starting provisioning", "Provisioning")
	if err := r.Status().Update(ctx, chatBot); err != nil {
		log.Error(err, "Failed to update status to Provisioning")
		return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
	}

	// Requeue to start provisioning
	return ctrl.Result{Requeue: true}, nil
}

// handleProvisioning handles the Provisioning phase
func (r *ChatBotReconciler) handleProvisioning(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Handling Provisioning phase")

	// Check if provisioning is complete
	if chatBot.Status.BotID != "" && chatBot.Status.BotToken != "" {
		log.Info("Provisioning appears complete, transitioning to Ready")
		chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhaseReady, "Provisioning complete", "Ready")
		if err := r.Status().Update(ctx, chatBot); err != nil {
			log.Error(err, "Failed to update status to Ready")
			return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
		}
		return ctrl.Result{}, nil
	}

	// Simulate provisioning (in real implementation, this would call the provisioner)
	log.Info("Provisioning in progress")

	// For demo purposes, we'll simulate provisioning completion
	// In a real implementation, this would:
	// 1. Call the appropriate provisioner based on Platform
	// 2. Create necessary Kubernetes resources (Deployments, Services, Secrets, etc.)
	// 3. Wait for resources to be ready
	// 4. Update status with BotID, BotToken, WebhookURL

	// Simulate provisioning delay
	return ctrl.Result{RequeueAfter: 5 * time.Second}, nil
}

// handleReady handles the Ready phase
func (r *ChatBotReconciler) handleReady(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Handling Ready phase")

	// Check if the bot is still enabled
	if !chatBot.Spec.Enabled {
		log.Info("Bot is disabled, transitioning to Terminating")
		chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhaseTerminating, "Bot disabled", "Disabled")
		if err := r.Status().Update(ctx, chatBot); err != nil {
			return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
		}
		return ctrl.Result{Requeue: true}, nil
	}

	// Check health and update metrics
	if err := r.updateBotHealth(ctx, chatBot, log); err != nil {
		log.Error(err, "Failed to update bot health")
		// Don't fail the reconciliation, just log the error
	}

	// Requeue for periodic health checks
	return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
}

// handleUpdating handles the Updating phase
func (r *ChatBotReconciler) handleUpdating(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Handling Updating phase")

	// In a real implementation, this would:
	// 1. Update the bot configuration
	// 2. Restart or update the deployment
	// 3. Wait for the update to complete

	// For now, just transition back to Ready
	chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhaseReady, "Update complete", "Ready")
	if err := r.Status().Update(ctx, chatBot); err != nil {
		return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
	}

	return ctrl.Result{}, nil
}

// handleTerminating handles the Terminating phase
func (r *ChatBotReconciler) handleTerminating(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Handling Terminating phase")

	// In a real implementation, this would:
	// 1. Delete the bot from the platform
	// 2. Clean up Kubernetes resources
	// 3. Transition to Deleted

	// For now, just transition to Deleted
	chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhaseDeleted, "Deletion complete", "Deleted")
	if err := r.Status().Update(ctx, chatBot); err != nil {
		return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
	}

	return ctrl.Result{}, nil
}

// handleFailed handles the Failed phase
func (r *ChatBotReconciler) handleFailed(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) (ctrl.Result, error) {
	log.Info("Handling Failed phase")

	// Check if we should retry
	if chatBot.Status.LastError != nil && chatBot.Status.LastError.Count < maxRetryCount {
		log.Info("Retrying after failure", "retryCount", chatBot.Status.LastError.Count+1)
		chatBot.SetChatBotPhase(chatbotv1alpha1.ChatBotPhasePending, "Retrying after failure", "Retry")
		if err := r.Status().Update(ctx, chatBot); err != nil {
			return ctrl.Result{}, fmt.Errorf("failed to update status: %w", err)
		}
		return ctrl.Result{RequeueAfter: 10 * time.Second}, nil
	}

	// Permanent failure, stay in Failed state
	return ctrl.Result{}, nil
}

// validateChatBot validates the ChatBot specification
func (r *ChatBotReconciler) validateChatBot(chatBot *chatbotv1alpha1.ChatBot) error {
	// Check required fields
	if chatBot.Spec.Platform == "" {
		return fmt.Errorf("platform is required")
	}

	if chatBot.Spec.Name == "" {
		return fmt.Errorf("name is required")
	}

	if chatBot.Spec.Configuration.BackendURL == "" {
		return fmt.Errorf("backendURL is required")
	}

	// Validate platform
	validPlatforms := []chatbotv1alpha1.PlatformType{
		chatbotv1alpha1.PlatformSlack,
		chatbotv1alpha1.PlatformMatrix,
		chatbotv1alpha1.PlatformDiscord,
		chatbotv1alpha1.PlatformTwilio,
	}

	for _, p := range validPlatforms {
		if chatBot.Spec.Platform == p {
			return nil
		}
	}

	return fmt.Errorf("invalid platform: %s", chatBot.Spec.Platform)
}

// updateBotHealth updates the bot's health status and metrics
func (r *ChatBotReconciler) updateBotHealth(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) error {
	// In a real implementation, this would:
	// 1. Check if the bot deployment is running
	// 2. Check if the bot is responding to health checks
	// 3. Update metrics (messages processed, errors, etc.)

	// For demo purposes, just increment message count
	chatBot.IncrementMessagesProcessed()

	// Update the status
	if err := r.Status().Update(ctx, chatBot); err != nil {
		return fmt.Errorf("failed to update health status: %w", err)
	}

	return nil
}

// cleanupChatBot performs cleanup when a ChatBot is deleted
func (r *ChatBotReconciler) cleanupChatBot(ctx context.Context, chatBot *chatbotv1alpha1.ChatBot, log logr.Logger) error {
	// In a real implementation, this would:
	// 1. Delete the bot from the platform (Slack, Discord, etc.)
	// 2. Clean up Kubernetes resources (Deployments, Services, Secrets, ConfigMaps)
	// 3. Remove webhook registrations

	log.Info("Cleaning up ChatBot resources", "name", chatBot.Name)

	// For demo purposes, just log the cleanup
	return nil
}

// SetupWithManager sets up the controller with the Manager
func (r *ChatBotReconciler) SetupWithManager(mgr ctrl.Manager) error {
	// Create a new controller
	c, err := ctrl.NewControllerManagedBy(mgr).
		For(&chatbotv1alpha1.ChatBot{}).
		WithOptions(controller.Options{
			MaxConcurrentReconciles: 10,
			Reconciler:              r,
		}).
		Watches(
			&source.Kind{Type: &chatbotv1alpha1.BotPlatform{}},
			&handler.EnqueueRequestForOwner{OwnerType: &chatbotv1alpha1.ChatBot{}},
		).
		Watches(
			&source.Kind{Type: &chatbotv1alpha1.BotConfiguration{}},
			&handler.EnqueueRequestForOwner{OwnerType: &chatbotv1alpha1.ChatBot{}},
		).
		Watches(
			&source.Kind{Type: &chatbotv1alpha1.BotCredential{}},
			&handler.EnqueueRequestForOwner{OwnerType: &chatbotv1alpha1.ChatBot{}},
		).
		Build(r)

	if err != nil {
		return fmt.Errorf("failed to create controller: %w", err)
	}

	return nil
}

// contains checks if a string slice contains a value
func contains(slice []string, value string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

// remove removes a value from a string slice
func remove(slice []string, value string) []string {
	var result []string
	for _, item := range slice {
		if item != value {
			result = append(result, item)
		}
	}
	return result
}

// Constants
const (
	chatbotFinalizer = "chatbotoperator.io/finalizer"
	maxRetryCount    = 3
)

// RegisterChatBotController registers the ChatBot controller with the manager
func RegisterChatBotController(mgr manager.Manager) error {
	if err := (&ChatBotReconciler{
		Client: mgr.GetClient(),
		Log:    ctrl.Log.WithName("controllers").WithName("ChatBot"),
		Scheme: mgr.GetScheme(),
	}).SetupWithManager(mgr); err != nil {
		return fmt.Errorf("failed to register ChatBot controller: %w", err)
	}
	return nil
}

// GetChatBotReconciler returns a new ChatBotReconciler for testing
func GetChatBotReconciler(client client.Client, scheme *runtime.Scheme) *ChatBotReconciler {
	return &ChatBotReconciler{
		Client: client,
		Log:    log.Log.WithName("test").WithName("ChatBot"),
		Scheme: scheme,
	}
}

// Mock implementations for testing

// MockProvisioner is a mock implementation of a provisioner
type MockProvisioner struct {
	Platform chatbotv1alpha1.PlatformType
	ProvisionFunc func(ctx context.Context, bot *chatbotv1alpha1.ChatBot) (*ProvisionResult, error)
}

// ProvisionResult contains the result of provisioning
type ProvisionResult struct {
	BotID       string
	BotToken   string
	WebhookURL string
	Error      error
}

// Provision provisions a bot
func (m *MockProvisioner) Provision(ctx context.Context, bot *chatbotv1alpha1.ChatBot) (*ProvisionResult, error) {
	if m.ProvisionFunc != nil {
		return m.ProvisionFunc(ctx, bot)
	}
	return &ProvisionResult{
		BotID:       "mock-bot-id",
		BotToken:   "mock-bot-token",
		WebhookURL: "https://mock.webhook.url",
	}, nil
}

// MockDeprovisioner is a mock implementation of a deprovisioner
type MockDeprovisioner struct {
	Platform chatbotv1alpha1.PlatformType
	DeprovisionFunc func(ctx context.Context, bot *chatbotv1alpha1.ChatBot) error
}

// Deprovision deprovisions a bot
func (m *MockDeprovisioner) Deprovision(ctx context.Context, bot *chatbotv1alpha1.ChatBot) error {
	if m.DeprovisionFunc != nil {
		return m.DeprovisionFunc(ctx, bot)
	}
	return nil
}

// Ensure interfaces are satisfied
var _ reconcile.Reconciler = &ChatBotReconciler{}
var _ client.Client = &MockClient{}

// MockClient is a mock client for testing
type MockClient struct {
	client.Client
	GetFunc    func(ctx context.Context, key types.NamespacedName, obj client.Object) error
	ListFunc   func(ctx context.Context, list client.ObjectList, opts ...client.ListOption) error
	CreateFunc func(ctx context.Context, obj client.Object, opts ...client.CreateOption) error
	UpdateFunc func(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error
	DeleteFunc func(ctx context.Context, obj client.Object, opts ...client.DeleteOption) error
	PatchFunc  func(ctx context.Context, obj client.Object, patch client.Patch, opts ...client.PatchOption) error
	StatusFunc func() client.StatusWriter
}

// Get implements client.Client
func (m *MockClient) Get(ctx context.Context, key types.NamespacedName, obj client.Object) error {
	if m.GetFunc != nil {
		return m.GetFunc(ctx, key, obj)
	}
	return nil
}

// List implements client.Client
func (m *MockClient) List(ctx context.Context, list client.ObjectList, opts ...client.ListOption) error {
	if m.ListFunc != nil {
		return m.ListFunc(ctx, list, opts...)
	}
	return nil
}

// Create implements client.Client
func (m *MockClient) Create(ctx context.Context, obj client.Object, opts ...client.CreateOption) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, obj, opts...)
	}
	return nil
}

// Update implements client.Client
func (m *MockClient) Update(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, obj, opts...)
	}
	return nil
}

// Delete implements client.Client
func (m *MockClient) Delete(ctx context.Context, obj client.Object, opts ...client.DeleteOption) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, obj, opts...)
	}
	return nil
}

// Patch implements client.Client
func (m *MockClient) Patch(ctx context.Context, obj client.Object, patch client.Patch, opts ...client.PatchOption) error {
	if m.PatchFunc != nil {
		return m.PatchFunc(ctx, obj, patch, opts...)
	}
	return nil
}

// Status implements client.Client
func (m *MockClient) Status() client.StatusWriter {
	if m.StatusFunc != nil {
		return m.StatusFunc()
	}
	return &MockStatusWriter{}
}

// MockStatusWriter is a mock status writer
type MockStatusWriter struct{}

// Update implements client.StatusWriter
func (m *MockStatusWriter) Update(ctx context.Context, obj client.Object, opts ...client.UpdateOption) error {
	return nil
}

// Patch implements client.StatusWriter
func (m *MockStatusWriter) Patch(ctx context.Context, obj client.Object, patch client.Patch, opts ...client.PatchOption) error {
	return nil
}

// Deep copy equality check for testing
func deepEqual(a, b interface{}) bool {
	return reflect.DeepEqual(a, b)
}
