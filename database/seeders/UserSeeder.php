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
            User::create([
                'name' => $u['name'],
                'email' => $u['email'],
                'email_verified_at' => $u['email_verified_at'],
                'password' => Hash::make($u['password']),
                'terms' => $u['terms'] ?? false,
                'role' => $u['role'],
                'status' => $u['status'],
            ]);
        }
    }
}
