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
        if (!Schema::hasColumn('users', 'stripe_connect_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('stripe_connect_id')->nullable()->after('remember_token');
                $table->boolean('stripe_connect_active')->default(false)->after('stripe_connect_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'stripe_connect_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn(['stripe_connect_id', 'stripe_connect_active']);
            });
        }
    }
};
