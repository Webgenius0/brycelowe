<?php

use App\Http\Controllers\API\Auth\LoginController;
use App\Http\Controllers\API\Auth\ProfileUpdateController;
use App\Http\Controllers\API\Auth\RegisterController;
use App\Http\Controllers\API\Auth\SocialLoginController;
use App\Http\Controllers\API\DynamicPage\DynamicPageController;
use App\Http\Controllers\API\SystemSetting\SystemSettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authenticated User
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum', 'check.status']);

// System Settings
Route::get('/system-setting', [SystemSettingController::class, 'systemSetting']);

// Dynamic Pages & FAQ
Route::get('/faq', [DynamicPageController::class, 'faq']);
Route::get('/page/{slug}', [DynamicPageController::class, 'show']);
Route::get('/dynamic-pages', [DynamicPageController::class, 'index']);

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

// Authenticated User Routes
Route::group(['middleware' => ['auth:sanctum', 'check.status']], function () {
    Route::get('/user-detail', [LoginController::class, 'userDetails']);
    Route::post('/logout', [LoginController::class, 'logout']);

    // Profile update routes
    Route::post('/change-password', [ProfileUpdateController::class, 'changePassword']);
    Route::post('/account-delete', [ProfileUpdateController::class, 'accountDelete']);
    Route::post('/profile/update', [ProfileUpdateController::class, 'updateDetails']);
});
