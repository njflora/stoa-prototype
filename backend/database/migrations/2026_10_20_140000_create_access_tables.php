<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Accounts and what they can do: membership tiers, discussion (comments,
 * votes, forum topics), reading lists, single-episode purchases, community
 * memberships, and the platforms each episode is published on.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('tier')->nullable(); // bronze, silver or gold; null for a free account
            $table->boolean('is_staff')->default(false);
        });

        // A thread is any discussion: "episode:{id}", "article:{id}", "live:live-show".
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->string('thread');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->text('body');
            $table->unsignedInteger('likes')->default(0);
            $table->unsignedInteger('dislikes')->default(0);
            $table->dateTime('posted_at');
            $table->index(['thread', 'posted_at']);
        });

        // One vote per person per comment.
        Schema::create('comment_votes', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('comment_id')->constrained()->cascadeOnDelete();
            $table->string('direction'); // up or down
            $table->primary(['user_id', 'comment_id']);
        });

        // A list is "episode:{id}" or "live:live-show". Articles carry their own.
        Schema::create('reading_list_items', function (Blueprint $table) {
            $table->id();
            $table->string('list');
            $table->unsignedTinyInteger('position');
            $table->string('type'); // Book, Article, Report or Data
            $table->string('title');
            $table->string('source');
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('at')->nullable(); // seconds into the show
            $table->string('to')->nullable(); // a page on this site
            $table->index(['list', 'position']);
        });

        // Members' episodes bought one at a time, kept on the account.
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('episode_id');
            $table->foreign('episode_id')->references('id')->on('episodes');
            $table->timestamps();
            $table->unique(['user_id', 'episode_id']);
        });

        Schema::create('community_members', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('community_id'); // such as "philosophy-circle"
            $table->timestamps();
            $table->primary(['user_id', 'community_id']);
        });

        // Topics started in a community's forums: "philosophy-circle/ethics".
        Schema::create('forum_topics', function (Blueprint $table) {
            $table->id();
            $table->string('forum');
            $table->foreignId('user_id')->constrained();
            $table->string('title');
            $table->timestamps();
            $table->index(['forum', 'created_at']);
        });

        // Where each episode can be watched. Filled in stage E; the watch
        // check already guards it.
        Schema::create('episode_sources', function (Blueprint $table) {
            $table->id();
            $table->string('episode_id');
            $table->string('platform'); // rumble, odysee, bitchute or vod
            $table->string('external_id')->nullable();
            $table->string('embed_url')->nullable();
            $table->string('status'); // linked, pending, missing or failed
            $table->dateTime('synced_at')->nullable();
            $table->foreign('episode_id')->references('id')->on('episodes')->cascadeOnDelete();
            $table->unique(['episode_id', 'platform']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episode_sources');
        Schema::dropIfExists('forum_topics');
        Schema::dropIfExists('community_members');
        Schema::dropIfExists('purchases');
        Schema::dropIfExists('reading_list_items');
        Schema::dropIfExists('comment_votes');
        Schema::dropIfExists('comments');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['tier', 'is_staff']);
        });
    }
};
