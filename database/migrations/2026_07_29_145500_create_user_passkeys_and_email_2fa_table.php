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
        if (!Schema::hasColumn('users', 'email_2fa_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('email_2fa_enabled')->default(false)->after('two_factor_confirmed_at');
            });
        }

        if (!Schema::hasTable('user_passkeys')) {
            Schema::create('user_passkeys', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('name')->default('Passkey Device');
                $table->string('credential_id', 500)->unique();
                $table->text('public_key');
                $table->string('device_type')->nullable(); // e.g. "Touch ID", "Windows Hello", "YubiKey"
                $table->timestamp('last_used_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_passkeys');
        if (Schema::hasColumn('users', 'email_2fa_enabled')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('email_2fa_enabled');
            });
        }
    }
};
