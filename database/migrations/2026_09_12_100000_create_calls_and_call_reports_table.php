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
        // 1. Calls Table
        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->uuid('call_id')->unique();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->timestamp('timestamp')->nullable()->useCurrent();
            $table->integer('trust_gain')->default(0);
            $table->integer('ai_adherance')->default(0);
            $table->string('outcome', 50)->nullable(); // LEAD_OUTCOME
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('duration')->default(0); // duration in seconds
            $table->string('duration_formatted', 50)->nullable(); // e.g. '04:12'
            $table->boolean('in_queue')->default(false);
            $table->timestamp('next_call')->nullable();
            $table->timestamps();
        });

        // 2. Call Reports Table
        Schema::create('call_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('call_id')->constrained('calls')->cascadeOnDelete();
            $table->string('agent')->nullable();
            $table->string('lead_source')->nullable();
            $table->timestamp('timestamp')->nullable()->useCurrent();
            $table->string('duration', 50)->nullable();
            $table->text('summery')->nullable(); // summary spelling in diagram
            $table->text('summary')->nullable(); // alias
            $table->json('response_tiem')->nullable(); // response_time spelling in diagram
            $table->json('response_time')->nullable(); // alias
            $table->json('prompt_utilization')->nullable();
            $table->text('cache_insight')->nullable();
            $table->text('response_timing_insight')->nullable();
            $table->json('key_moment_log')->nullable();
            $table->json('agent_tone_and_feedback')->nullable();
            $table->json('conversion_indicators')->nullable();
            $table->integer('talk_ratio')->default(50);
            $table->integer('listen_ratio')->default(50);
            $table->integer('trust_score')->default(0);
            $table->json('key_insights')->nullable();
            $table->json('objections')->nullable();
            $table->json('sentiment')->nullable();
            $table->json('next_step')->nullable();
            $table->json('ai_performance')->nullable();
            $table->string('recording_file_url', 500)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('call_reports');
        Schema::dropIfExists('calls');
    }
};
