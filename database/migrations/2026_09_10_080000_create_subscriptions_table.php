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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('current_period_start')->nullable();
            $table->dateTime('current_period_end')->nullable();
            $table->dateTime('end_at')->nullable();
            $table->enum('status', ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'PENDING'])->default('ACTIVE');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
