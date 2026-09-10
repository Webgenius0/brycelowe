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
        Schema::create('billings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subscription_id')->constrained('subscriptions')->cascadeOnDelete();
            $table->string('invoice_number')->unique();
            $table->dateTime('date')->nullable();
            $table->string('status')->default('PAID');
            $table->string('pdf')->nullable();
            $table->integer('call_credit')->default(0);
            $table->integer('report_credit')->default(0);
            $table->integer('playbook_credit')->default(0);
            $table->integer('calibration_credit')->default(0);
            $table->decimal('overusages_amount', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('billings');
    }
};
