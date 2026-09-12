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
        Schema::create('training_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('content_category', 100)->default('General'); // AI_TRAINING_CONTENT_CATEGORY
            $table->string('type', 50)->default('Document'); // AI_TRAINING_CONTENT_TYPE (Audio, Video, PDF, Text, etc.)
            $table->string('file', 500)->nullable();
            $table->string('size', 50)->nullable();
            $table->string('status', 50)->default('Pending'); // AI_TRAINING_CONTENT_STATUS (Pending, Processing, Trained, Failed, Active)
            $table->timestamp('upload_at')->nullable()->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_contents');
    }
};
