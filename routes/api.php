<?php

use App\Http\Controllers\API\Auth\LoginController;
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
    Route::get('/user-detail', [LoginController::class, 'userDetails']);
    Route::post('/logout', [LoginController::class, 'logout']);

    // Profile update routes
    Route::post('/change-password', [ProfileUpdateController::class, 'changePassword']);
    Route::post('/account-delete', [ProfileUpdateController::class, 'accountDelete']);
    Route::post('/profile/update', [ProfileUpdateController::class, 'updateDetails']);

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
