<?php

use App\Http\Controllers\Settings\MailSettingsController;
use App\Http\Controllers\Settings\MultiTwoFactorController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\StripeSettingsController;
use App\Http\Controllers\Settings\SystemSettingsController;
use App\Http\Controllers\Settings\SystemToolsController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    Route::inertia('settings/docs', 'settings/docs')->name('settings.docs');

    Route::get('settings/stripe', [StripeSettingsController::class, 'edit'])->name('stripe.edit');
    Route::patch('settings/stripe', [StripeSettingsController::class, 'update'])->name('stripe.update');

    Route::get('settings/system', [SystemSettingsController::class, 'edit'])->name('system.edit');
    Route::patch('settings/system', [SystemSettingsController::class, 'update'])->name('system.update');

    Route::get('settings/mail', [MailSettingsController::class, 'edit'])->name('mail.edit');
    Route::patch('settings/mail', [MailSettingsController::class, 'update'])->name('mail.update');

    // Multi 2FA & Passkey Routes
    Route::post('settings/two-factor-global/toggle', [MultiTwoFactorController::class, 'toggleGlobal2fa'])->name('two-factor.global.toggle');
    Route::post('settings/two-factor-email/toggle', [MultiTwoFactorController::class, 'toggleEmail2fa'])->name('two-factor.email.toggle');
    Route::post('settings/two-factor-email/send', [MultiTwoFactorController::class, 'sendEmailCode'])->name('two-factor.email.send');
    Route::post('settings/two-factor-email/verify', [MultiTwoFactorController::class, 'verifyEmailCode'])->name('two-factor.email.verify');
    Route::post('settings/passkeys', [MultiTwoFactorController::class, 'storePasskey'])->name('passkeys.store');
    Route::delete('settings/passkeys/{id}', [MultiTwoFactorController::class, 'deletePasskey'])->name('passkeys.destroy');

    // System Tools
    Route::get('settings/system-tools', [SystemToolsController::class, 'index'])->name('system-tools.index');
    Route::post('settings/system-tools/optimize-clear', [SystemToolsController::class, 'optimizeClear'])->name('system-tools.optimize-clear');
    Route::post('settings/system-tools/optimize', [SystemToolsController::class, 'optimize'])->name('system-tools.optimize');
    Route::post('settings/system-tools/clear-logs', [SystemToolsController::class, 'clearLogs'])->name('system-tools.clear-logs');
    Route::get('settings/system-tools/logs', [SystemToolsController::class, 'logs'])->name('system-tools.logs');
    Route::post('settings/system-tools/unblock-ip/{id}', [SystemToolsController::class, 'unblockIp'])->name('system-tools.unblock-ip');
    Route::post('settings/system-tools/clear-attempts', [SystemToolsController::class, 'clearAllAttempts'])->name('system-tools.clear-attempts');
});
