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
        if (!Schema::hasTable('login_activities')) {
            Schema::create('login_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->timestamp('timestamp')->nullable()->useCurrent();
                $table->string('device')->nullable();
                $table->string('browser')->nullable();
                $table->string('location')->nullable();
                $table->string('ip', 45)->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->string('status')->default('Success');
                $table->timestamp('last_login')->nullable();
                $table->boolean('is_active')->default(true);
                $table->boolean('is_block')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_activities');
    }
};
