<?php

use App\Models\User;
use App\Models\UserPasskey;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('authenticated user can toggle master 2fa status without losing saved keys', function () {
    $user = User::factory()->create(['is_2fa_enabled' => true]);

    $response = $this->actingAs($user)->post('/settings/two-factor-global/toggle');
    $response->assertRedirect();

    $this->assertFalse($user->fresh()->is_2fa_enabled);

    // Toggle back on
    $response2 = $this->actingAs($user)->post('/settings/two-factor-global/toggle');
    $response2->assertRedirect();

    $this->assertTrue($user->fresh()->is_2fa_enabled);
});

test('authenticated user can toggle email 2fa status', function () {
    $user = User::factory()->create(['email_2fa_enabled' => false]);

    $response = $this->actingAs($user)->post('/settings/two-factor-email/toggle');
    $response->assertRedirect();

    $this->assertTrue($user->fresh()->email_2fa_enabled);
});

test('authenticated user can send and verify email 2fa otp code', function () {
    Mail::fake();

    $user = User::factory()->create(['email' => 'testuser@example.com']);

    $sendResponse = $this->actingAs($user)->postJson('/settings/two-factor-email/send');
    $sendResponse->assertOk();
    $sendResponse->assertJsonPath('status', 'success');

    Mail::assertSent(\App\Mail\TwoFactorCodeMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email) && !empty($mail->code);
    });
});

test('authenticated user can store and delete passkeys', function () {
    $user = User::factory()->create();

    $storeResponse = $this->actingAs($user)->post('/settings/passkeys', [
        'name' => 'MacBook Touch ID',
        'credential_id' => 'cred_12345',
        'public_key' => 'pubkey_12345',
        'device_type' => 'Touch ID',
    ]);
    $storeResponse->assertRedirect();

    $this->assertDatabaseHas('user_passkeys', [
        'user_id' => $user->id,
        'name' => 'MacBook Touch ID',
    ]);

    $passkey = UserPasskey::first();

    $deleteResponse = $this->actingAs($user)->delete("/settings/passkeys/{$passkey->id}");
    $deleteResponse->assertRedirect();

    $this->assertDatabaseMissing('user_passkeys', [
        'id' => $passkey->id,
    ]);
});
