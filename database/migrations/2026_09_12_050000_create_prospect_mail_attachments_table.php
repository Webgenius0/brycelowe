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
        if (!Schema::hasTable('prospect_mail_attachments')) {
            Schema::create('prospect_mail_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('prospect_mail_id')->constrained('prospect_mails')->cascadeOnDelete();
                $table->string('file', 500);
                $table->string('file_name', 255)->nullable();
                $table->string('file_type', 100)->nullable();
                $table->integer('file_size')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prospect_mail_attachments');
    }
};
