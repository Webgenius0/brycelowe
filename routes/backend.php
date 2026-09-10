<?php

use App\Http\Controllers\Web\Company\CompanyProfileController;
use App\Http\Controllers\Web\Dynamic\DynamicPageController;
use App\Http\Controllers\Web\Faq\FaqController;
use App\Http\Controllers\Web\Plan\PlanController;
use App\Http\Controllers\Web\Subscription\SubscriptionController;
use App\Http\Controllers\Web\Ticket\TicketController;
use App\Http\Controllers\Web\User\UserController;
use Illuminate\Support\Facades\Route;



// --- Users ---
Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::get('/user', [UserController::class, 'index'])->name('user.index');
Route::get('/user/create', [UserController::class, 'create'])->name('user.create');
Route::post('/user/store', [UserController::class, 'store'])->name('user.store');
Route::get('/user/edit/{id}', [UserController::class, 'edit'])->name('user.edit');
Route::patch('/user/update/{id}', [UserController::class, 'update'])->name('user.update');
Route::delete('/user/destroy/{id}', [UserController::class, 'destroy'])->name('user.destroy');
Route::post('/user/status-update', [UserController::class, 'statusUpdate'])->name('user.status.update');
Route::get('/users/export', [UserController::class, 'export'])->name('users.export');

// --- Dynamic Pages ---
Route::get('/dynamic', [DynamicPageController::class, 'index'])->name('dynamic.index');
Route::get('/dynamic/create', [DynamicPageController::class, 'create'])->name('dynamic.create');
Route::post('/dynamic/store', [DynamicPageController::class, 'store'])->name('dynamic.store');
Route::get('/dynamic/edit/{id}', [DynamicPageController::class, 'edit'])->name('dynamic.edit');
Route::patch('/dynamic/update/{id}', [DynamicPageController::class, 'update'])->name('dynamic.update');
Route::delete('/dynamic/destroy/{id}', [DynamicPageController::class, 'destroy'])->name('dynamic.destroy');

// --- FAQ ---
Route::get('/faq', [FaqController::class, 'index'])->name('faq.index');
Route::post('/faq/store', [FaqController::class, 'store'])->name('faq.store');
Route::patch('/faq/update/{id}', [FaqController::class, 'update'])->name('faq.update');
Route::delete('/faq/destroy/{id}', [FaqController::class, 'destroy'])->name('faq.destroy');

// --- Plans ---
Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
Route::get('/plan', [PlanController::class, 'index'])->name('plan.index');
Route::post('/plan/store', [PlanController::class, 'store'])->name('plan.store');
Route::patch('/plan/update/{id}', [PlanController::class, 'update'])->name('plan.update');
Route::post('/plan/toggle/{id}', [PlanController::class, 'toggleStatus'])->name('plan.toggle');
Route::post('/plan/discount/toggle/{id}', [PlanController::class, 'toggleDiscountStatus'])->name('plan.discount.toggle');
Route::delete('/plan/destroy/{id}', [PlanController::class, 'destroy'])->name('plan.destroy');


// --- Company Profiles ---
Route::get('/companies', [CompanyProfileController::class, 'index'])->name('companies.index');
Route::get('/company', [CompanyProfileController::class, 'index'])->name('company.index');
Route::post('/company/store', [CompanyProfileController::class, 'store'])->name('company.store');
Route::patch('/company/update/{id}', [CompanyProfileController::class, 'update'])->name('company.update');
Route::delete('/company/destroy/{id}', [CompanyProfileController::class, 'destroy'])->name('company.destroy');

// --- Support Tickets ---
Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
Route::get('/ticket', [TicketController::class, 'index'])->name('ticket.index');
Route::post('/ticket/store', [TicketController::class, 'store'])->name('ticket.store');
Route::post('/ticket/update/{id}', [TicketController::class, 'update'])->name('ticket.update');
Route::post('/ticket/status/{id}', [TicketController::class, 'updateStatus'])->name('ticket.status');
Route::delete('/ticket/destroy/{id}', [TicketController::class, 'destroy'])->name('ticket.destroy');

// --- Subscriptions & Billing ---
Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
Route::post('/subscription/store', [SubscriptionController::class, 'store'])->name('subscription.store');
Route::patch('/subscription/update/{id}', [SubscriptionController::class, 'update'])->name('subscription.update');
Route::post('/subscription/status/{id}', [SubscriptionController::class, 'updateStatus'])->name('subscription.status');
Route::post('/subscription/overusage/{id}', [SubscriptionController::class, 'recordOverusage'])->name('subscription.overusage');
Route::delete('/subscription/destroy/{id}', [SubscriptionController::class, 'destroy'])->name('subscription.destroy');



