<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('banned user cannot login via API', function () {
    $bannedUser = User::factory()->create([
        'email' => 'banned@example.com',
        'password' => Hash::make('password123'),
        'status' => 'Banned',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'banned@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'status' => false,
            'message' => 'Your account has been banned.',
        ]);
});

test('inactive user cannot login via API', function () {
    $inactiveUser = User::factory()->create([
        'email' => 'inactive@example.com',
        'password' => Hash::make('password123'),
        'status' => 'Inactive',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'inactive@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(403)
        ->assertJson([
            'status' => false,
            'message' => 'Your account is inactive. Please contact support.',
        ]);
});

test('banned user authenticated API request is rejected and token revoked', function () {
    $user = User::factory()->create([
        'email' => 'user@example.com',
        'password' => Hash::make('password123'),
        'status' => 'Active',
        'email_verified_at' => now(),
    ]);

    $token = $user->createToken('AuthToken')->plainTextToken;

    // Update user status to Banned
    $user->update(['status' => 'Banned']);

    $response = $this->withHeader('Authorization', 'Bearer ' . $token)
        ->getJson('/api/user-detail');

    $response->assertStatus(403)
        ->assertJson([
            'status' => false,
            'message' => 'Your account has been banned.',
        ]);

    // Token should be revoked
    $this->assertCount(0, $user->tokens);
});

test('active user can login and access API endpoints', function () {
    $activeUser = User::factory()->create([
        'email' => 'active@example.com',
        'password' => Hash::make('password123'),
        'status' => 'Active',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'active@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'status' => true,
            'message' => 'Login Successful',
        ]);
});
