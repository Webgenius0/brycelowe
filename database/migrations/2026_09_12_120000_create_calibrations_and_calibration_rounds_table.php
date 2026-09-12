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
        // 1. Calibrations Table
        Schema::create('calibrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title')->nullable();
            $table->timestamp('timestamp')->nullable()->useCurrent();
            $table->integer('total_time')->default(0); // duration in seconds
            $table->string('total_time_formatted', 50)->nullable();
            $table->decimal('overall_score', 5, 2)->default(0.00);
            $table->integer('round_complted')->default(0); // spelling in diagram
            $table->integer('round_completed')->default(0); // alias
            $table->string('status', 50)->default('pending');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // 2. Calibration Rounds Table
        Schema::create('calibration_rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calibration_id')->constrained('calibrations')->cascadeOnDelete();
            $table->decimal('word_choice', 5, 2)->default(0.00);
            $table->decimal('pacing', 5, 2)->default(0.00);
            $table->decimal('sentiment', 5, 2)->default(0.00);
            $table->decimal('tone', 5, 2)->default(0.00);
            $table->decimal('paus', 5, 2)->default(0.00); // spelling in diagram
            $table->decimal('pause', 5, 2)->default(0.00); // alias
            $table->decimal('energy', 5, 2)->default(0.00);
            $table->decimal('score', 5, 2)->default(0.00);
            $table->string('status', 50)->default('completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calibration_rounds');
        Schema::dropIfExists('calibrations');
    }
};
