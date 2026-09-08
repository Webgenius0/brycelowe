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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('descripton')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('discount_price', 10, 2)->nullable();
            $table->enum('interval', ['MONTHLY', 'YEARLY', 'WEEKLY', 'DAILY', 'LIFETIME', 'CUSTOM'])->default('MONTHLY');
            $table->integer('call_credit')->default(0);
            $table->integer('report_credit')->default(0);
            $table->integer('playbook_credit')->default(0);
            $table->integer('calibration_credit')->default(0);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_trial')->default(false);
            $table->integer('trial_period')->default(0)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
