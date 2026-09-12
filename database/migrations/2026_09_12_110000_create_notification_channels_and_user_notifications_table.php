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
        // 1. Notification Channels Table
        Schema::create('notification_channels', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('logo', 500)->nullable();
            $table->string('channel_type', 50)->default('IN APP'); // 'IN APP', 'CALL REMAINDER', 'FOLLOW UP', 'AI INSIGHT', 'BILLING', 'PRODUCT'
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. User Notifications Table
        Schema::create('user_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('notification_channel_id')->constrained('notification_channels')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'notification_channel_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('notification_channels');
    }
};
