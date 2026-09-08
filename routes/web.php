<?php

use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\Notification\NotificationController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;


Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return inertia('auth/login', [
        'canRegister' => Features::enabled(
            Features::registration()
        ),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notification routes
    Route::prefix('notifications')->name('notification.')->group(function () {
        Route::get('/list', [NotificationController::class, 'getNotifications'])->name('list');
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead'])->name('read');
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead'])->name('read-all');
        Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
    });
});

// Public routes for 2FA Login Challenge (Email OTP & Passkeys)
Route::post('two-factor-challenge/email/send', [\App\Http\Controllers\Settings\MultiTwoFactorController::class, 'sendLoginEmailCode'])->name('two-factor.login.email.send');
Route::post('two-factor-challenge/email/verify', [\App\Http\Controllers\Settings\MultiTwoFactorController::class, 'verifyLoginEmailCode'])->name('two-factor.login.email.verify');
Route::get('two-factor-challenge/passkeys', [\App\Http\Controllers\Settings\MultiTwoFactorController::class, 'getLoginPasskeys'])->name('two-factor.login.passkeys');
Route::post('two-factor-challenge/passkey/verify', [\App\Http\Controllers\Settings\MultiTwoFactorController::class, 'verifyLoginPasskey'])->name('two-factor.login.passkey.verify');

require __DIR__.'/settings.php';
