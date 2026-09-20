<?php

use App\Http\Controllers\API\Auth\LoginController;
use App\Http\Controllers\API\Auth\ProfileController;
use App\Http\Controllers\API\Auth\RegisterController;
use App\Http\Controllers\API\Auth\SocialLoginController;
use App\Http\Controllers\API\Call\CallController;
use App\Http\Controllers\API\DynamicPage\DynamicPageController;
use App\Http\Controllers\API\Lead\LeadController;
use App\Http\Controllers\API\MailApiController;
use App\Http\Controllers\API\Notification\NotificationController;
use App\Http\Controllers\API\Plan\PlanController;
use App\Http\Controllers\API\Subscription\SubscriptionController;
use App\Http\Controllers\API\SystemSetting\SystemSettingController;
use App\Http\Controllers\API\Ticket\TicketController;
use App\Http\Controllers\API\Training\TrainingContentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authenticated User Profile
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', 'check.status']);

// System Settings
Route::get('/system-setting', [SystemSettingController::class, 'systemSetting']);

// Dynamic Pages & FAQ
Route::get('/faq', [DynamicPageController::class, 'faq']);
Route::get('/page/{slug}', [DynamicPageController::class, 'show']);
Route::get('/dynamic-pages', [DynamicPageController::class, 'index']);

// Subscription Plans (Public browse)
Route::get('/plans', [PlanController::class, 'index']);
Route::get('/plans/{id}', [PlanController::class, 'show']);
Route::post('/plans/check-discount', [PlanController::class, 'checkDiscount']);

// Guest Authentication Routes
Route::middleware(['guest'])->group(function () {
    Route::post('login', [LoginController::class, 'login']);
    Route::post('login/social', [SocialLoginController::class, 'socialLogin']);
    Route::post('register', [RegisterController::class, 'register']);
    Route::post('resend_otp', [RegisterController::class, 'resend_otp']);
    Route::post('verify_otp', [RegisterController::class, 'verify_otp']);
    Route::post('forgot-password', [RegisterController::class, 'forgot_password']);
    Route::post('forgot-verify-otp', [RegisterController::class, 'forgot_verify_otp']);
    Route::post('reset-password', [RegisterController::class, 'reset_password']);
});

// Authenticated Routes
Route::group(['middleware' => ['auth:sanctum', 'check.status']], function () {
    Route::get('/user-detail', [ProfileController::class, 'me']);
    Route::post('/logout', [LoginController::class, 'logout']);

    // 1. Profile Information & Full Name Update
    Route::post('/profile/update', [ProfileController::class, 'updateName']);
    Route::post('/profile/name', [ProfileController::class, 'updateName']);

    // 2. Avatar Management (Upload / Delete)
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::post('/profile/upload-avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::post('/profile/delete-avatar', [ProfileController::class, 'deleteAvatar']);

    // 3. Language & Timezone Preferences
    Route::get('/profile/preferences', [ProfileController::class, 'getPreferences']);
    Route::post('/profile/preferences', [ProfileController::class, 'updatePreferences']);
    Route::post('/profile/language-timezone', [ProfileController::class, 'updatePreferences']);

    // 4. Notification Preferences
    Route::get('/profile/notifications', [ProfileController::class, 'getNotifications']);
    Route::post('/profile/notifications', [ProfileController::class, 'updateNotifications']);

    // 5. 2FA Security Management
    Route::get('/profile/2fa', [ProfileController::class, 'get2FAStatus']);
    Route::post('/profile/2fa/toggle', [ProfileController::class, 'toggle2FA']);
    Route::post('/profile/2fa/enable', [ProfileController::class, 'toggle2FA']);
    Route::post('/profile/2fa/disable', [ProfileController::class, 'toggle2FA']);

    // 6. Login Activity History & Devices
    Route::get('/profile/login-activity', [ProfileController::class, 'loginActivity']);
    Route::get('/profile/devices', [ProfileController::class, 'getDevices']);
    Route::post('/profile/devices/logout-others', [ProfileController::class, 'logoutOtherDevices']);
    Route::delete('/profile/devices/{id}', [ProfileController::class, 'revokeDevice']);

    // 7. Password & Account Deletion
    Route::post('/change-password', [ProfileController::class, 'changePassword']);
    Route::post('/account-delete', [ProfileController::class, 'deleteAccount']);

    // Support Tickets API
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::patch('/tickets/{id}/status', [TicketController::class, 'updateStatus']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);

    // Subscriptions, Usages & Billing API
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscriptions', [SubscriptionController::class, 'store']);
    Route::get('/subscriptions/{id}', [SubscriptionController::class, 'show']);
    Route::post('/subscriptions/{id}/overusage', [SubscriptionController::class, 'recordOverusage']);
    Route::post('/subscriptions/{id}/cancel', [SubscriptionController::class, 'cancel']);
    Route::get('/billings', [SubscriptionController::class, 'billings']);

    // Plan Management API (Admin)
    Route::post('/plans', [PlanController::class, 'store']);
    Route::put('/plans/{id}', [PlanController::class, 'update']);
    Route::delete('/plans/{id}', [PlanController::class, 'destroy']);

    // Prospect Mail & Support API
    Route::get('/mail/recents', [MailApiController::class, 'recents']);
    Route::get('/mail/templates', [MailApiController::class, 'templates']);
    Route::post('/mail/send', [MailApiController::class, 'send']);
    Route::post('/mail/ai-assist', [MailApiController::class, 'aiAssist']);

    // Leads Management API
    Route::get('/leads', [LeadController::class, 'index']);
    Route::post('/leads', [LeadController::class, 'store']);
    Route::get('/leads/{id}', [LeadController::class, 'show']);
    Route::match(['put', 'patch'], '/leads/{id}', [LeadController::class, 'update']);
    Route::delete('/leads/{id}', [LeadController::class, 'destroy']);
    Route::post('/leads/{id}/activities', [LeadController::class, 'addActivity']);
    Route::post('/leads/{id}/numbers', [LeadController::class, 'addNumber']);
    Route::delete('/leads/{id}/numbers/{numberId}', [LeadController::class, 'deleteNumber']);

    // Calls & AI Call Reports API (Call History & Follow-up Queue)
    Route::get('/calls', [CallController::class, 'index']);
    Route::get('/calls/history', [CallController::class, 'history']);
    Route::get('/calls/followup-queue', [CallController::class, 'followupQueue']);
    Route::get('/calls/follow-up-queue', [CallController::class, 'followupQueue']);
    Route::post('/calls', [CallController::class, 'store']);
    Route::get('/calls/{id}', [CallController::class, 'show']);
    Route::patch('/calls/{id}/outcome', [CallController::class, 'updateOutcome']);
    Route::patch('/calls/{id}/queue', [CallController::class, 'toggleQueue']);
    Route::get('/calls/{id}/report', [CallController::class, 'report']);
    Route::match(['post', 'put'], '/calls/{id}/report', [CallController::class, 'saveReport']);
    Route::post('/calls/{id}/recording', [CallController::class, 'uploadRecording']);
    Route::delete('/calls/{id}', [CallController::class, 'destroy']);

    // AI Training Content API
    Route::get('/training-contents', [TrainingContentController::class, 'index']);
    Route::post('/training-contents', [TrainingContentController::class, 'store']);
    Route::get('/training-contents/{id}', [TrainingContentController::class, 'show']);
    Route::match(['put', 'patch'], '/training-contents/{id}', [TrainingContentController::class, 'update']);
    Route::post('/training-contents/{id}/toggle-status', [TrainingContentController::class, 'toggleStatus']);
    Route::delete('/training-contents/{id}', [TrainingContentController::class, 'destroy']);

    // In-App Notifications Feed & Channel Preferences API
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/clear-all', [NotificationController::class, 'clearAll']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::get('/notifications/channels', [NotificationController::class, 'channels']);
    Route::post('/notifications/channels/{id}/toggle', [NotificationController::class, 'toggleChannel']);
    Route::post('/notifications/test', [NotificationController::class, 'sendTestNotification']);
});
