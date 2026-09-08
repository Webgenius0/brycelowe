<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'external_user_role')) {
                $table->enum('external_user_role', ['SUPERADMIN', 'SELS', 'MANAGER', 'AUDIOTOR'])->nullable()->after('role');
            }
        });

        // Modify the role column to support new roles
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('SUPERADMIN', 'SELS', 'MANAGER', 'AUDIOTOR', 'Admin', 'User', 'Partner') DEFAULT 'SUPERADMIN'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'external_user_role')) {
                $table->dropColumn('external_user_role');
            }
        });
    }
};
