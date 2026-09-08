<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'is_2fa_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_2fa_enabled')->default(true)->after('email_2fa_enabled');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'is_2fa_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_2fa_enabled');
            });
        }
    }
};
