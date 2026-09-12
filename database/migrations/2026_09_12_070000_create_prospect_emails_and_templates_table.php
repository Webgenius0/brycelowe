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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('subject');
            $table->text('body');
            $table->string('category')->default('General');
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        Schema::create('prospect_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('to');
            $table->string('cc')->nullable();
            $table->string('bcc')->nullable();
            $table->string('subject');
            $table->longText('message');
            $table->json('attachments')->nullable();
            $table->boolean('is_tracked')->default(true);
            $table->enum('status', ['Draft', 'Sent', 'Opened', 'Scheduled', 'Failed'])->default('Sent');
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prospect_emails');
        Schema::dropIfExists('email_templates');
    }
};
