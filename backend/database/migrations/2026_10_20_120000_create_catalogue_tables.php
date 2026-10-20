<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The catalogue: shows, the people who present them, every episode, the
 * series episodes belong to, and articles. One record per episode, whatever
 * platforms it is published on (those links arrive with episode_sources).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shows', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('tagline');
            $table->string('access'); // free or premium: the show as a whole
            $table->json('host_ids'); // the regular presenters, in order
            $table->json('palette'); // glow, base and highlight colours for title cards
            $table->boolean('streamed_live')->default(false); // recordings keep a live chat replay
            $table->json('slot'); // when it airs: days, hour, minute, and whether live
            $table->string('unit'); // what a release is called: episodes, parts, interviews
            $table->string('schedule'); // "Live weekdays at 1:00 pm"
            $table->unsignedSmallInteger('position'); // display order
        });

        Schema::create('contributors', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('role');
            $table->text('bio');
            $table->unsignedSmallInteger('position');
        });

        Schema::create('series', function (Blueprint $table) {
            $table->string('slug')->primary();
            $table->string('name')->unique();
            $table->string('show_id');
            $table->text('description');
            $table->unsignedSmallInteger('position'); // newest series first
            $table->foreign('show_id')->references('id')->on('shows');
        });

        Schema::create('episodes', function (Blueprint $table) {
            $table->string('id')->primary(); // "{show}-{seq}"
            $table->string('show_id');
            $table->unsignedInteger('seq'); // counts up from the show's first episode
            $table->unsignedInteger('number')->nullable(); // the public running number, "#1530"
            $table->string('title')->nullable(); // empty for daily editions, titled by date
            $table->json('topics')->nullable();
            $table->dateTime('published_at');
            $table->unsignedSmallInteger('duration_min');
            $table->string('access'); // free, freemium (free preview) or premium
            $table->boolean('live')->nullable(); // only set where the show records it
            $table->boolean('edition')->default(false);
            $table->string('series_slug')->nullable();
            $table->unsignedSmallInteger('series_part')->nullable();
            $table->unsignedSmallInteger('series_of')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('comments_count')->default(0);

            $table->foreign('show_id')->references('id')->on('shows');
            $table->foreign('series_slug')->references('slug')->on('series');
            // The archive's queries: a show's episodes by date, by access, and by views.
            $table->index(['show_id', 'published_at']);
            $table->index(['show_id', 'access', 'published_at']);
            $table->index(['published_at', 'views']);
        });

        Schema::create('contributor_episode', function (Blueprint $table) {
            $table->string('contributor_id');
            $table->string('episode_id');
            $table->unsignedTinyInteger('position'); // the order names are listed in
            $table->primary(['contributor_id', 'episode_id']);
            $table->index('episode_id');
            $table->foreign('contributor_id')->references('id')->on('contributors');
            $table->foreign('episode_id')->references('id')->on('episodes')->cascadeOnDelete();
        });

        Schema::create('articles', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->text('standfirst');
            $table->string('author_id');
            $table->string('category');
            $table->dateTime('published_at');
            $table->unsignedSmallInteger('read_min');
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('likes')->default(0);
            $table->unsignedInteger('dislikes')->default(0);
            // Many votes, split close to evenly, scores high. Kept up to date by
            // the model on every save, so "controversial" is an indexed sort.
            $table->float('controversy')->default(0);
            $table->json('body'); // paragraphs; "## " marks a subheading
            $table->json('reading_list');
            $table->string('watch_next_id');

            $table->foreign('author_id')->references('id')->on('contributors');
            $table->foreign('watch_next_id')->references('id')->on('episodes');
            $table->index(['category', 'published_at']);
            $table->index(['category', 'controversy']);
        });

        // The snapshot's clock. The prototype's catalogue was generated on a
        // fixed day, so "this week" counts back from then. One row.
        Schema::create('catalogue_meta', function (Blueprint $table) {
            $table->id();
            $table->dateTime('generated_at');
        });

        Schema::create('live_events', function (Blueprint $table) {
            $table->id();
            $table->string('show_id');
            $table->unsignedInteger('number');
            $table->string('title');
            $table->json('host_ids');
            $table->unsignedInteger('viewers');
            $table->unsignedTinyInteger('start_hour');
            $table->foreign('show_id')->references('id')->on('shows');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_events');
        Schema::dropIfExists('catalogue_meta');
        Schema::dropIfExists('articles');
        Schema::dropIfExists('contributor_episode');
        Schema::dropIfExists('episodes');
        Schema::dropIfExists('series');
        Schema::dropIfExists('contributors');
        Schema::dropIfExists('shows');
    }
};
