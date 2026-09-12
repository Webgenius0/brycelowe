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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'language')) {
                $table->string('language', 10)->default('en')->after('address');
            }
            if (!Schema::hasColumn('users', 'timezone')) {
                $table->string('timezone', 100)->default('UTC')->after('language');
            }
            if (!Schema::hasColumn('users', 'notification_preferences')) {
                $table->json('notification_preferences')->nullable()->after('timezone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('users', 'language')) $columns[] = 'language';
            if (Schema::hasColumn('users', 'timezone')) $columns[] = 'timezone';
            if (Schema::hasColumn('users', 'notification_preferences')) $columns[] = 'notification_preferences';

            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
