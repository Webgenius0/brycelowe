<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery\MockInterface;

uses(RefreshDatabase::class);

function mockSocialiteUser(string $email, string $name = 'Test Google User', ?string $avatar = 'https://example.com/avatar.jpg')
{
    $socialUser = Mockery::mock(SocialiteUser::class);
    $socialUser->shouldReceive('getEmail')->andReturn($email);
    $socialUser->shouldReceive('getName')->andReturn($name);
    $socialUser->shouldReceive('getAvatar')->andReturn($avatar);

    $driver = Mockery::mock();
    $driver->shouldReceive('stateless')->andReturnSelf();
    $driver->shouldReceive('userFromToken')->with('valid-google-token')->andReturn($socialUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($driver);
}

test('registered user can login via google without sending role', function () {
    $user = User::factory()->create([
        'email' => 'registered@example.com',
        'role' => 'User',
        'status' => 'Active',
    ]);

    mockSocialiteUser('registered@example.com');

    $response = $this->postJson('/api/login/social', [
        'provider_id' => 'google',
        'token' => 'valid-google-token',
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => true,
            'message' => 'Login Successful',
        ])
        ->assertJsonPath('data.email', 'registered@example.com');
});

test('unregistered user receives 422 if role is not provided', function () {
    mockSocialiteUser('newuser@example.com');

    $response = $this->postJson('/api/login/social', [
        'provider_id' => 'google',
        'token' => 'valid-google-token',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => false,
            'code' => 422,
            'is_new_user' => true,
            'message' => 'Role is required for unregistered users.',
        ])
        ->assertJsonStructure([
            'errors' => ['role'],
        ]);

    expect(User::where('email', 'newuser@example.com')->exists())->toBeFalse();
});

test('unregistered user receives 422 if invalid role is provided', function () {
    mockSocialiteUser('newuser2@example.com');

    $response = $this->postJson('/api/login/social', [
        'provider_id' => 'google',
        'token' => 'valid-google-token',
        'role' => 'Admin',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'status' => false,
            'code' => 422,
            'message' => 'Invalid role specified. Role must be User or Partner.',
        ]);

    expect(User::where('email', 'newuser2@example.com')->exists())->toBeFalse();
});

test('unregistered user can register and login via google when valid role is sent', function () {
    mockSocialiteUser('newpartner@example.com', 'New Partner User');

    $response = $this->postJson('/api/login/social', [
        'provider_id' => 'google',
        'token' => 'valid-google-token',
        'role' => 'Partner',
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => true,
            'message' => 'Login Successful',
        ])
        ->assertJsonPath('data.email', 'newpartner@example.com')
        ->assertJsonPath('data.role', 'Partner');

    $createdUser = User::where('email', 'newpartner@example.com')->first();
    expect($createdUser)->not->toBeNull();
    expect($createdUser->role)->toBe('Partner');
    expect($createdUser->status)->toBe('Active');
});

test('inactive or banned user cannot login via google', function () {
    $user = User::factory()->create([
        'email' => 'banned@example.com',
        'role' => 'User',
        'status' => 'Banned',
    ]);

    mockSocialiteUser('banned@example.com');

    $response = $this->postJson('/api/login/social', [
        'provider_id' => 'google',
        'token' => 'valid-google-token',
    ]);

    $response->assertStatus(403);
});
