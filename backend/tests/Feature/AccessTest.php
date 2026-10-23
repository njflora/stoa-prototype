<?php

namespace Tests\Feature;

use App\Models\Purchase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Members-only content never leaves the server for anyone else. Each test
 * builds a tiny catalogue: one free daily show (open discussion) and one
 * members' show, with a couple of comments, sources and stream links.
 */
class AccessTest extends TestCase
{
    use RefreshDatabase;

    private User $free;

    private User $member;

    protected function setUp(): void
    {
        parent::setUp();

        DB::table('catalogue_meta')->insert(['generated_at' => '2026-10-19 23:00:00']);
        $show = fn (string $id, string $access) => [
            'id' => $id, 'name' => $id, 'tagline' => '', 'access' => $access, 'host_ids' => '[]', 'palette' => '[]',
            'streamed_live' => false, 'slot' => '{}', 'unit' => 'episodes', 'schedule' => '', 'position' => 0,
        ];
        DB::table('shows')->insert([$show('stoa-podcast', 'free'), $show('chronos', 'premium')]);
        $episode = fn (string $id, string $showId, int $seq, string $access) => [
            'id' => $id, 'show_id' => $showId, 'seq' => $seq, 'title' => $id, 'published_at' => '2026-10-18 12:00:00',
            'duration_min' => 60, 'access' => $access,
        ];
        DB::table('episodes')->insert([
            $episode('stoa-podcast-1', 'stoa-podcast', 1, 'free'),
            $episode('chronos-1', 'chronos', 1, 'premium'),
            $episode('chronos-2', 'chronos', 2, 'premium'),
        ]);

        $this->free = User::factory()->create(['name' => 'free_fred']);
        $this->member = User::factory()->create(['name' => 'gold_gill', 'tier' => 'gold']);
        $commenter = User::factory()->create(['name' => 'MargaretH', 'tier' => 'silver']);
        $comment = fn (string $thread, string $text) => [
            'thread' => $thread, 'user_id' => $commenter->id, 'body' => $text, 'posted_at' => '2026-10-18 13:00:00',
        ];
        DB::table('comments')->insert([
            $comment('episode:chronos-1', 'A secret members-only opinion.'),
            $comment('episode:chronos-1', 'Another one for members.'),
            $comment('episode:stoa-podcast-1', 'An open comment anyone can read.'),
        ]);
        DB::table('reading_list_items')->insert([
            ['list' => 'episode:chronos-1', 'position' => 0, 'type' => 'Book', 'title' => 'A Members Book', 'source' => 'Someone', 'year' => 2020],
        ]);
        DB::table('episode_sources')->insert([
            ['episode_id' => 'chronos-1', 'platform' => 'vod', 'embed_url' => 'https://vod.example/chronos-1.m3u8', 'status' => 'linked'],
            ['episode_id' => 'chronos-2', 'platform' => 'vod', 'embed_url' => 'https://vod.example/chronos-2.m3u8', 'status' => 'linked'],
        ]);
    }

    public function test_a_free_account_gets_a_count_not_comments_on_a_members_show(): void
    {
        $response = $this->actingAs($this->free)->getJson('/api/threads/episode/chronos-1');

        $response->assertOk()
            ->assertExactJson(['locked' => true, 'open' => false, 'count' => 2])
            ->assertDontSee('secret members-only opinion')
            ->assertDontSee('MargaretH');
    }

    public function test_signed_out_visitors_get_counts_only_for_members_threads_and_reading_lists(): void
    {
        $this->getJson('/api/threads/episode/chronos-1')->assertExactJson(['locked' => true, 'open' => false, 'count' => 2]);
        $this->getJson('/api/reading-lists/episode/chronos-1')->assertExactJson(['locked' => true, 'open' => false, 'count' => 1]);
        $this->getJson('/api/threads/episode/stoa-podcast-1')
            ->assertJsonPath('locked', false)
            ->assertJsonPath('canPost', false)
            ->assertJsonPath('comments.0.text', 'An open comment anyone can read.');
    }

    public function test_a_member_reads_the_members_discussion_and_reading_list(): void
    {
        $this->actingAs($this->member)->getJson('/api/threads/episode/chronos-1')
            ->assertJsonPath('locked', false)
            ->assertJsonPath('canPost', true)
            ->assertJsonCount(2, 'comments');
        $this->actingAs($this->member)->getJson('/api/reading-lists/episode/chronos-1')
            ->assertJsonPath('items.0.title', 'A Members Book');
    }

    public function test_a_purchase_unlocks_one_episodes_sources_and_no_others(): void
    {
        $this->actingAs($this->free)->getJson('/api/episodes/chronos-1/play')->assertExactJson(['locked' => true]);

        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'chronos-1'])
            ->assertCreated()
            ->assertJsonPath('purchases', ['chronos-1']);

        $this->actingAs($this->free)->getJson('/api/episodes/chronos-1/play')
            ->assertJsonPath('locked', false)
            ->assertJsonPath('sources.0.embedUrl', 'https://vod.example/chronos-1.m3u8');
        $this->actingAs($this->free)->getJson('/api/episodes/chronos-2/play')
            ->assertExactJson(['locked' => true])
            ->assertDontSee('chronos-2.m3u8');
    }

    public function test_a_purchase_does_not_open_the_members_discussion(): void
    {
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'chronos-1'])->assertCreated();

        $this->actingAs($this->free)->getJson('/api/threads/episode/chronos-1')->assertJsonPath('locked', true);
    }

    public function test_only_members_episodes_can_be_bought(): void
    {
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'stoa-podcast-1'])->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/purchases', ['episodeId' => 'chronos-1'])->assertUnauthorized();
    }

    public function test_buying_an_episode_twice_keeps_one_purchase(): void
    {
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'chronos-1'])->assertCreated();
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'chronos-1'])
            ->assertCreated()
            ->assertJsonPath('purchases', ['chronos-1']);

        $this->assertSame(1, Purchase::where('user_id', $this->free->id)->count());
    }

    public function test_a_purchase_needs_a_real_episode(): void
    {
        $this->actingAs($this->free)->postJson('/api/purchases', [])->assertUnprocessable();
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => ['chronos-1']])->assertUnprocessable();
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'no-such-episode'])->assertNotFound();

        $this->assertSame(0, Purchase::count());
    }

    public function test_purchases_are_listed_newest_first(): void
    {
        $this->travelTo('2026-10-20 10:00');
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'chronos-1'])->assertCreated();
        $this->travelTo('2026-10-21 10:00');
        $this->actingAs($this->free)->postJson('/api/purchases', ['episodeId' => 'chronos-2'])->assertCreated();

        $this->actingAs($this->free)->getJson('/api/me')->assertJsonPath('purchases', ['chronos-2', 'chronos-1']);
    }

    public function test_staff_watch_members_episodes(): void
    {
        $staff = User::factory()->create(['is_staff' => true]);

        $this->actingAs($staff)->getJson('/api/episodes/chronos-1/play')->assertJsonPath('locked', false);
    }

    public function test_an_unknown_episode_cannot_be_played(): void
    {
        $this->actingAs($this->member)->getJson('/api/episodes/no-such-episode/play')->assertNotFound();
    }

    public function test_a_free_account_cannot_post_in_a_members_only_thread_or_forum(): void
    {
        $this->actingAs($this->free)
            ->postJson('/api/threads/episode/chronos-1/comments', ['text' => 'Let me in'])
            ->assertForbidden();
        $this->actingAs($this->free)
            ->postJson('/api/forums/philosophy-circle/ethics/topics', ['title' => 'Let me in'])
            ->assertForbidden();

        $this->assertDatabaseMissing('comments', ['body' => 'Let me in']);
        $this->assertDatabaseMissing('forum_topics', ['title' => 'Let me in']);
    }

    public function test_a_free_account_posts_in_open_spaces(): void
    {
        $this->actingAs($this->free)
            ->postJson('/api/threads/episode/stoa-podcast-1/comments', ['text' => 'Great show'])
            ->assertCreated()
            ->assertJsonPath('user', 'free_fred')
            ->assertJsonPath('tier', 'free')
            ->assertJsonPath('mine', true);
        $this->actingAs($this->free)
            ->postJson('/api/forums/philosophy-circle/general-discussion/topics', ['title' => 'Hello all'])
            ->assertCreated();
    }

    public function test_members_post_anywhere_and_signed_out_visitors_nowhere(): void
    {
        $this->actingAs($this->member)
            ->postJson('/api/threads/episode/chronos-1/comments', ['text' => 'Members agree'])
            ->assertCreated();
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/threads/episode/stoa-podcast-1/comments', ['text' => 'Anonymous'])->assertUnauthorized();
    }

    public function test_votes_count_once_switch_and_undo(): void
    {
        $id = DB::table('comments')->where('thread', 'episode:stoa-podcast-1')->value('id');
        $vote = fn (?string $direction) => $this->actingAs($this->free)->postJson("/api/comments/{$id}/vote", ['direction' => $direction]);

        $vote('up')->assertExactJson(['likes' => 1, 'dislikes' => 0, 'myVote' => 'up']);
        $vote('up')->assertExactJson(['likes' => 1, 'dislikes' => 0, 'myVote' => 'up']);
        $vote('down')->assertExactJson(['likes' => 0, 'dislikes' => 1, 'myVote' => 'down']);
        $vote(null)->assertExactJson(['likes' => 0, 'dislikes' => 0, 'myVote' => null]);
    }

    public function test_a_free_account_cannot_vote_in_a_members_thread(): void
    {
        $id = DB::table('comments')->where('thread', 'episode:chronos-1')->value('id');

        $this->actingAs($this->free)->postJson("/api/comments/{$id}/vote", ['direction' => 'up'])->assertForbidden();
    }

    public function test_the_demo_sign_in_picks_a_seeded_account_without_a_password(): void
    {
        User::factory()->create(['name' => 'chris_m', 'email' => 'demo-member@stoa.test', 'tier' => 'gold']);
        $fromTheSite = ['Referer' => 'http://localhost:5174/'];

        $this->postJson('/api/demo/login', ['as' => 'member'], $fromTheSite)
            ->assertOk()
            ->assertJsonPath('user.name', 'chris_m')
            ->assertJsonPath('user.initials', 'CM')
            ->assertJsonPath('user.tier', 'gold');
        $this->getJson('/api/me', $fromTheSite)->assertJsonPath('user.tier', 'gold');
        $this->postJson('/api/demo/login', ['as' => 'admin'], $fromTheSite)->assertUnprocessable();
    }
}
