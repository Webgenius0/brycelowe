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
        if (!Schema::hasTable('leads')) {
            Schema::create('leads', function (Blueprint $table) {
                $table->id();
                $table->string('full_name');
                $table->string('email')->nullable()->index();
                $table->string('phone_number')->nullable();
                $table->string('company_name')->nullable();
                $table->string('city')->nullable();
                $table->string('state')->nullable();
                $table->string('zip_code')->nullable();
                $table->text('notes')->nullable();
                $table->string('status')->default('New'); // LEAD_STATUS
                $table->string('lead_type')->default('Inbound'); // LEAD_TYPE
                $table->string('outcome')->nullable(); // LEAD_OUTCOME
                $table->timestamp('last_call')->nullable();
                $table->string('priority')->default('Medium');
                $table->json('tags')->nullable();
                $table->decimal('estimated_value', 14, 2)->default(0.00);
                $table->integer('trust_gain')->default(0);
                $table->integer('ai_adherance')->default(0);
                $table->integer('total_call')->default(0);
                $table->string('source')->default('Website'); // LEAD_SOURCE
                $table->boolean('is_lead')->default(true);
                $table->foreignId('lead_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
