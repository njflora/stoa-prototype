<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** The platforms the live show streams on, at the same time. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('live_events', function (Blueprint $table) {
            $table->json('sources')->nullable(); // [{ platform, status, embedUrl? }]
        });
    }

    public function down(): void
    {
        Schema::table('live_events', function (Blueprint $table) {
            $table->dropColumn('sources');
        });
    }
};
