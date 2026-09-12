<?php

use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);



test('public plans api returns list of plans', function () {
    Plan::create([
        'name' => 'Starter API Plan',
        'price' => 29.00,
        'interval' => 'MONTHLY',
        'call_credit' => 100,
        'report_credit' => 50,
        'playbook_credit' => 10,
        'calibration_credit' => 5,
        'is_active' => true,
    ]);

    $response = $this->getJson('/api/plans');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'message',
            'data' => [
                '*' => ['id', 'name', 'price', 'interval', 'overages_rates', 'discounts'],
            ],
        ]);
});

test('authenticated user can open a support ticket', function () {
    $user = User::factory()->create([
        'is_active' => true,
        'status' => 'Active',
    ]);
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/tickets', [
        'category' => 'TECHNICAL',
        'priority' => 'HIGH',
        'subject' => 'Database connection timeout',
        'message' => 'Experiencing intermittent latency issues.',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'status',
            'message',
            'data' => ['id', 'ticket_id', 'subject', 'status', 'is_open'],
        ]);
});

test('authenticated user can subscribe to plan and record overusage', function () {
    $user = User::factory()->create([
        'is_active' => true,
        'status' => 'Active',
    ]);
    Sanctum::actingAs($user);


    $plan = Plan::create([
        'name' => 'Pro Cloud Tier',
        'price' => 99.00,
        'interval' => 'MONTHLY',
        'call_credit' => 500,
        'report_credit' => 200,
        'playbook_credit' => 50,
        'calibration_credit' => 20,
        'is_active' => true,
    ]);

    $plan->overagesRates()->create([
        'overages_type' => 'CALL',
        'overages_rate' => 0.05,
    ]);

    // 1. Subscribe
    $subResponse = $this->postJson('/api/subscriptions', [
        'plan_id' => $plan->id,
    ]);

    $subResponse->assertStatus(201);
    $subId = $subResponse->json('data.subscription.id');

    // 2. Record Overusage
    $overResponse = $this->postJson("/api/subscriptions/{$subId}/overusage", [
        'overages_type' => 'CALL',
        'credit' => 20,
    ]);

    $overResponse->assertStatus(200)
        ->assertJson([
            'status' => 200,
            'data' => [
                'unit_rate' => 0.05,
                'added_cost' => 1.00,
                'total_overage_cost' => 1.00,
            ],
        ]);

    // 3. Check billings
    $billResponse = $this->getJson('/api/billings');
    $billResponse->assertStatus(200);
});
