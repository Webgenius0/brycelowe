<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin',
                'email' => 'admin@admin.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'Admin',
                'status' => 'Active',
            ],
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'Admin',
                'status' => 'Active',
            ],
            [
                'name' => 'User',
                'email' => 'user@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'User',
                'status' => 'Active',
            ],
            [
                'name' => 'Partner',
                'email' => 'partner@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'Partner',
                'status' => 'Active',
            ],
        ];

        foreach ($users as $u) {
            $user = User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'email_verified_at' => $u['email_verified_at'],
                'password' => Hash::make($u['password']),
                'terms' => $u['terms'] ?? false,
                'role' => $u['role'],
                'status' => $u['status'],
                'points' => $u['role'] === 'User' ? 250 : 0,
                'points_valid_till' => $u['role'] === 'User' ? now()->addMonth() : null,
            ]);

            if ($u['email'] === 'user@gmail.com') {
                \App\Models\Subscription::create([
                    'user_id' => $user->id,
                    'buyer_user_id' => $user->id,
                    'type' => 'Basic Pass',
                    'stripe_id' => 'sub_seed_1001',
                    'membership_id' => 'BAS-9918-5412',
                    'stripe_status' => 'active',
                    'ends_at' => now()->addMonth(),
                ]);
            }
        }
    }
}
