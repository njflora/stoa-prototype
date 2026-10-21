<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * GET /api/search answers in the shape the site's search panel reads.
 * Tests use Scout's in-memory driver (phpunit.xml), so they need no
 * Meilisearch; typo tolerance and ranking are Meilisearch's own.
 */
class SearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        DB::table('catalogue_meta')->insert(['generated_at' => '2026-10-19 23:00:00']);
        $show = fn (string $id, string $name, array $hosts) => [
            'id' => $id, 'name' => $name, 'tagline' => '', 'access' => 'free', 'host_ids' => json_encode($hosts), 'palette' => '[]',
            'streamed_live' => false, 'slot' => '{}', 'unit' => 'episodes', 'schedule' => '', 'position' => 0,
        ];
        DB::table('shows')->insert([$show('chronos', 'Chronos', ['helen']), $show('the-forum', 'The Forum', ['tom'])]);
        DB::table('contributors')->insert([
            ['id' => 'helen', 'name' => 'Helen Thwaite', 'role' => 'Historian', 'bio' => '', 'position' => 0],
            ['id' => 'gary', 'name' => 'Gary Lowther', 'role' => 'Political correspondent', 'bio' => '', 'position' => 1],
        ]);
        DB::table('series')->insert(['slug' => 'hannibal', 'name' => 'Hannibal', 'show_id' => 'chronos', 'description' => 'Rome against Carthage.', 'position' => 0]);
        DB::table('episodes')->insert([
            ['id' => 'chronos-42', 'show_id' => 'chronos', 'seq' => 42, 'title' => 'Chronos #201 | Cannae | Hannibal, Part 3', 'published_at' => '2026-01-10 12:00:00',
                'duration_min' => 70, 'access' => 'premium', 'edition' => false, 'series_slug' => 'hannibal', 'series_part' => 3, 'series_of' => 4],
            ['id' => 'the-forum-190', 'show_id' => 'the-forum', 'seq' => 190, 'title' => 'The Forum #190 | Road Trips', 'published_at' => '2026-08-07 18:00:00',
                'duration_min' => 100, 'access' => 'premium', 'edition' => false, 'series_slug' => null, 'series_part' => null, 'series_of' => null],
        ]);
        DB::table('contributor_episode')->insert([
            ['contributor_id' => 'helen', 'episode_id' => 'chronos-42', 'position' => 0],
            // Gary is not a regular on The Forum, only a guest.
            ['contributor_id' => 'gary', 'episode_id' => 'the-forum-190', 'position' => 0],
        ]);
    }

    public function test_results_come_grouped_in_the_search_panels_shape(): void
    {
        $this->getJson('/api/search?q=Cannae')
            ->assertOk()
            ->assertJsonStructure(['query', 'total', 'tookMs', 'groups' => ['episode', 'series', 'show', 'host', 'article']])
            ->assertJsonPath('groups.episode.0.id', 'chronos-42')
            ->assertJsonPath('groups.episode.0.showId', 'chronos');
    }

    public function test_an_episode_links_to_its_series_from_its_record(): void
    {
        $this->getJson('/api/search?q=Cannae')->assertJsonPath('groups.episode.0.to', '/watch/chronos-42?series=hannibal');
    }

    public function test_a_guest_contributor_is_found_by_the_shows_they_appear_on(): void
    {
        // Review note 9: Gary presents nothing regularly, but appears on The Forum.
        $this->getJson('/api/search?q=Forum')
            ->assertJsonPath('groups.host.0.id', 'gary')
            ->assertJsonPath('groups.host.0.to', '/contributors/gary');
    }

    public function test_an_empty_query_is_refused(): void
    {
        $this->getJson('/api/search?q=')->assertUnprocessable();
    }
}
