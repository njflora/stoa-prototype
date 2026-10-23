<?php

namespace Tests\Feature;

use App\Models\User;
use App\Sources\EpisodeMatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Testing\PendingCommand;
use Tests\TestCase;

/**
 * The platform sync and the content desk. Each test builds two episodes and
 * its own small sample feeds: an upload of each episode, as the platform
 * titles it, and one clip that is not an episode.
 */
class DeskTest extends TestCase
{
    use RefreshDatabase;

    private string $feeds;

    protected function setUp(): void
    {
        parent::setUp();

        DB::table('catalogue_meta')->insert(['generated_at' => '2026-10-19 23:00:00']);
        $show = fn (string $id, string $name) => [
            'id' => $id, 'name' => $name, 'tagline' => '', 'access' => 'free', 'host_ids' => '[]', 'palette' => '[]',
            'streamed_live' => false, 'slot' => '{}', 'unit' => 'episodes', 'schedule' => '', 'position' => 0,
        ];
        DB::table('shows')->insert([$show('chronos', 'Chronos'), $show('morning-brief', 'Morning Brief')]);
        DB::table('episodes')->insert([
            ['id' => 'chronos-121', 'show_id' => 'chronos', 'seq' => 121, 'title' => "Chronos #280 | Agincourt | The Hundred Years' War, Part 3",
                'published_at' => '2026-10-18 12:00:00', 'duration_min' => 76, 'access' => 'premium', 'edition' => false],
            ['id' => 'morning-brief-3120', 'show_id' => 'morning-brief', 'seq' => 3120, 'title' => null,
                'published_at' => '2026-10-20 07:00:00', 'duration_min' => 22, 'access' => 'free', 'edition' => true],
        ]);
        DB::table('episode_sources')->insert([
            ['episode_id' => 'chronos-121', 'platform' => 'bitchute', 'status' => 'missing'],
            ['episode_id' => 'morning-brief-3120', 'platform' => 'odysee', 'status' => 'pending'],
        ]);

        $this->feeds = storage_path('framework/testing/feeds');
        File::ensureDirectoryExists($this->feeds);
        config(['stoa.fixtures_path' => $this->feeds]);
        File::put("{$this->feeds}/bitchute.xml", <<<'XML'
            <?xml version="1.0" encoding="UTF-8"?>
            <rss version="2.0"><channel>
              <item><title>CHRONOS #280 - AGINCOURT - THE HUNDRED YEARS' WAR, PART 3</title><link>https://www.bitchute.com/video/AbC123/</link><guid>AbC123</guid><pubDate>Sun, 18 Oct 2026 13:30:00 GMT</pubDate></item>
              <item><title>Clip: Tom on the budget</title><link>https://www.bitchute.com/video/Zz9/</link><guid>Zz9</guid><pubDate>Sun, 18 Oct 2026 20:00:00 GMT</pubDate></item>
            </channel></rss>
            XML);
        File::put("{$this->feeds}/odysee.json", json_encode(['result' => ['items' => [
            ['claim_id' => 'f00d', 'name' => 'morning-brief-tue-20-oct-2026', 'value' => ['title' => 'Morning Brief | Tue, 20 Oct 2026 - Stoa', 'release_time' => (string) strtotime('2026-10-20 07:40:00 UTC')]],
        ]]], JSON_THROW_ON_ERROR));
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->feeds);
        parent::tearDown();
    }

    /** Runs the sync for one platform from its sample feed, and expects it to succeed. */
    private function sync(string $platform): void
    {
        $command = $this->artisan("stoa:sync {$platform} --fixtures");
        $this->assertInstanceOf(PendingCommand::class, $command);
        $command->assertSuccessful();
    }

    public function test_titles_are_compared_without_the_platforms_habits(): void
    {
        $this->assertSame(
            EpisodeMatcher::normalise("Chronos #280 | Agincourt | The Hundred Years' War, Part 3"),
            EpisodeMatcher::normalise("CHRONOS #280 - AGINCOURT - THE HUNDRED YEARS' WAR, PART 3 - Stoa"),
        );
    }

    public function test_a_sync_links_a_missing_upload_and_leaves_clips_unmatched(): void
    {
        $this->sync('bitchute');

        $this->assertDatabaseHas('episode_sources', ['episode_id' => 'chronos-121', 'platform' => 'bitchute', 'status' => 'linked', 'external_id' => 'AbC123']);
        $this->assertDatabaseHas('ingest_runs', ['platform' => 'bitchute', 'status' => 'ok', 'fetched' => 2, 'matched' => 1, 'linked' => 1, 'unmatched' => 1]);
    }

    public function test_a_daily_edition_matches_by_show_and_date(): void
    {
        $this->sync('odysee');

        $this->assertDatabaseHas('episode_sources', ['episode_id' => 'morning-brief-3120', 'platform' => 'odysee', 'status' => 'linked']);
    }

    public function test_syncing_twice_links_nothing_new(): void
    {
        $this->sync('bitchute');
        $this->sync('bitchute');

        $this->assertSame([1, 0], DB::table('ingest_runs')->orderBy('id')->pluck('linked')->all());
    }

    public function test_the_desk_is_for_staff_only(): void
    {
        $member = User::factory()->create(['tier' => 'gold']);
        $staff = User::factory()->create(['is_staff' => true]);

        $this->getJson('/api/desk')->assertUnauthorized();
        $this->actingAs($member)->getJson('/api/desk')->assertForbidden();
        $this->actingAs($member)->postJson('/api/desk/sync')->assertForbidden();
        $this->actingAs($staff)->getJson('/api/desk?filter=problems')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonPath('summary.bitchute.missing', 1);
    }

    public function test_staff_can_resync_from_the_desk(): void
    {
        $staff = User::factory()->create(['is_staff' => true]);

        $this->actingAs($staff)->postJson('/api/desk/sync', ['platform' => 'bitchute'])
            ->assertOk()
            ->assertJsonPath('runs.0.linked', 1)
            ->assertJsonPath('summary.bitchute.linked', 1)
            ->assertJsonPath('summary.bitchute.missing', 0);
    }
}
