<?php

use App\Http\Controllers\API\Auth\LoginController;
use App\Http\Controllers\API\Auth\ProfileController;
use App\Http\Controllers\API\Auth\ProfileUpdateController;
use App\Http\Controllers\API\Auth\RegisterController;
use App\Http\Controllers\API\Auth\SocialLoginController;
use App\Http\Controllers\API\DynamicPage\DynamicPageController;
use App\Http\Controllers\API\Plan\PlanController;
use App\Http\Controllers\API\Subscription\SubscriptionController;
use App\Http\Controllers\API\SystemSetting\SystemSettingController;
use App\Http\Controllers\API\Ticket\TicketController;
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
});
