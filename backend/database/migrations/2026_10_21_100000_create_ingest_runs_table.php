<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** One sync with one platform: what it fetched, matched and linked. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingest_runs', function (Blueprint $table) {
            $table->id();
            $table->string('platform');
            $table->boolean('fixtures')->default(false); // read a recorded sample feed, not the platform
            $table->string('status'); // running, ok or failed
            $table->unsignedInteger('fetched')->default(0); // items in the feed
            $table->unsignedInteger('matched')->default(0); // items that are episodes
            $table->unsignedInteger('linked')->default(0); // links that were new or changed
            $table->unsignedInteger('unmatched')->default(0); // items that are not episodes, such as clips
            $table->json('notes')->nullable(); // the unmatched titles, or the error
            $table->dateTime('started_at');
            $table->dateTime('finished_at')->nullable();
            $table->index(['platform', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingest_runs');
    }
};
