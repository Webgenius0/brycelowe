<?php

use App\Http\Controllers\API\Admin\AdminCompanyController;
use App\Http\Controllers\API\Admin\AdminDashboardController;
use App\Http\Controllers\API\Admin\AdminDynamicPageController;
use App\Http\Controllers\API\Admin\AdminFaqController;
use App\Http\Controllers\API\Admin\AdminPlanController;
use App\Http\Controllers\API\Admin\AdminSubscriptionController;
use App\Http\Controllers\API\Admin\AdminSystemSettingController;
use App\Http\Controllers\API\Admin\AdminTicketController;
use App\Http\Controllers\API\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin REST API Routes
|--------------------------------------------------------------------------
|
| Handled exclusively via API with Sanctum authentication & Role-based
| access control (SUPERADMIN and Admin roles).
| Base Prefix: /api/admin
|
*/

// 1. Dashboard & Analytics
Route::prefix('dashboard')->group(function () {
    Route::get('/stats', [AdminDashboardController::class, 'stats']);
    Route::get('/charts', [AdminDashboardController::class, 'charts']);
});

// 2. User & Staff Management
Route::prefix('users')->group(function () {
    Route::get('/', [AdminUserController::class, 'index']);
    Route::post('/', [AdminUserController::class, 'store']);
    Route::get('/roles/list', [AdminUserController::class, 'roles']);
    Route::get('/{id}', [AdminUserController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/{id}', [AdminUserController::class, 'update']);
    Route::post('/{id}/status', [AdminUserController::class, 'updateStatus']);
    Route::delete('/{id}', [AdminUserController::class, 'destroy']);
});

// 3. Plans & Pricing Management
Route::prefix('plans')->group(function () {
    Route::get('/', [AdminPlanController::class, 'index']);
    Route::post('/', [AdminPlanController::class, 'store']);
    Route::get('/{id}', [AdminPlanController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/{id}', [AdminPlanController::class, 'update']);
    Route::post('/{id}/toggle', [AdminPlanController::class, 'toggleStatus']);
    Route::delete('/{id}', [AdminPlanController::class, 'destroy']);
});

// 4. Subscriptions & Billing Monitoring
Route::prefix('subscriptions')->group(function () {
    Route::get('/', [AdminSubscriptionController::class, 'index']);
    Route::get('/{id}', [AdminSubscriptionController::class, 'show']);
    Route::post('/{id}/status', [AdminSubscriptionController::class, 'updateStatus']);
    Route::post('/{id}/overusage', [AdminSubscriptionController::class, 'recordOverusage']);
    Route::delete('/{id}', [AdminSubscriptionController::class, 'destroy']);
});

// 5. Company Profiles
Route::prefix('companies')->group(function () {
    Route::get('/', [AdminCompanyController::class, 'index']);
    Route::post('/', [AdminCompanyController::class, 'store']);
    Route::get('/{id}', [AdminCompanyController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/{id}', [AdminCompanyController::class, 'update']);
    Route::delete('/{id}', [AdminCompanyController::class, 'destroy']);
});

// 6. Support Tickets
Route::prefix('tickets')->group(function () {
    Route::get('/', [AdminTicketController::class, 'index']);
    Route::get('/{id}', [AdminTicketController::class, 'show']);
    Route::post('/{id}/status', [AdminTicketController::class, 'updateStatus']);
    Route::delete('/{id}', [AdminTicketController::class, 'destroy']);
});

// 7. Dynamic Pages
Route::prefix('pages')->group(function () {
    Route::get('/', [AdminDynamicPageController::class, 'index']);
    Route::post('/', [AdminDynamicPageController::class, 'store']);
    Route::get('/{id}', [AdminDynamicPageController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/{id}', [AdminDynamicPageController::class, 'update']);
    Route::delete('/{id}', [AdminDynamicPageController::class, 'destroy']);
});

// 8. FAQs
Route::prefix('faqs')->group(function () {
    Route::get('/', [AdminFaqController::class, 'index']);
    Route::post('/', [AdminFaqController::class, 'store']);
    Route::get('/{id}', [AdminFaqController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/{id}', [AdminFaqController::class, 'update']);
    Route::delete('/{id}', [AdminFaqController::class, 'destroy']);
});

// 9. System Settings
Route::prefix('system-settings')->group(function () {
    Route::get('/', [AdminSystemSettingController::class, 'show']);
    Route::match(['put', 'patch', 'post'], '/', [AdminSystemSettingController::class, 'update']);
});
