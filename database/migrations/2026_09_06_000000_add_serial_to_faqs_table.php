<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->unsignedInteger('serial')->default(0)->after('id');
        });

        DB::table('faqs')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get(['id'])
            ->each(function ($faq, $index) {
                DB::table('faqs')->where('id', $faq->id)->update([
                    'serial' => $index + 1,
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('faqs', function (Blueprint $table) {
            $table->dropColumn('serial');
        });
    }
};