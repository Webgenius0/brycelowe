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
                'name' => 'Super Admin',
                'email' => 'admin@admin.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'SUPERADMIN',
                'external_user_role' => 'SUPERADMIN',
                'user_type' => 'INTERNAL',
                'is_superuser' => true,
                'status' => 'Active',
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'SUPERADMIN',
                'external_user_role' => 'SUPERADMIN',
                'user_type' => 'INTERNAL',
                'is_superuser' => true,
                'status' => 'Active',
            ],
            [
                'name' => 'Manager One',
                'email' => 'manager@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'MANAGER',
                'external_user_role' => 'MANAGER',
                'user_type' => 'EXTERNAL',
                'is_superuser' => false,
                'status' => 'Active',
            ],
            [
                'name' => 'Sales Lead',
                'email' => 'sales@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'SELS',
                'external_user_role' => 'SELS',
                'user_type' => 'EXTERNAL',
                'is_superuser' => false,
                'status' => 'Active',
            ],
            [
                'name' => 'Quality Auditor',
                'email' => 'auditor@gmail.com',
                'email_verified_at' => now(),
                'password' => '12345678',
                'terms' => true,
                'role' => 'AUDIOTOR',
                'external_user_role' => 'AUDIOTOR',
                'user_type' => 'EXTERNAL',
                'is_superuser' => false,
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
                'external_user_role' => $u['external_user_role'] ?? $u['role'],
                'user_type' => $u['user_type'] ?? 'EXTERNAL',
                'is_superuser' => $u['is_superuser'] ?? false,
                'status' => $u['status'],
            ]);
        }
    }
}
