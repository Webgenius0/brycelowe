<?php

use App\Http\Controllers\Web\Dynamic\DynamicPageController;
use App\Http\Controllers\Web\Faq\FaqController;
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
