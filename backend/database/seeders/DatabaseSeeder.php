<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Loads the demo catalogue from database/seed, which scripts/data/generate.mjs
 * writes. On the real site this data would already be in the database; the
 * platform sync (stoa:sync) keeps it current.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $meta = $this->read('meta');
        DB::table('catalogue_meta')->insert(['generated_at' => $this->datetime($meta['generatedAt'])]);

        DB::table('shows')->insert(array_map(fn (array $show, int $position) => [
            'id' => $show['id'],
            'name' => $show['name'],
            'tagline' => $show['tagline'],
            'access' => $show['access'],
            'host_ids' => json_encode($show['hostIds']),
            'palette' => json_encode($show['palette']),
            'streamed_live' => $show['streamedLive'] ?? false,
            'slot' => json_encode($show['slot']),
            'unit' => $show['unit'],
            'schedule' => $show['schedule'],
            'position' => $position,
        ], $this->read('shows'), array_keys($this->read('shows'))));

        DB::table('contributors')->insert(array_map(fn (array $host, int $position) => [
            'id' => $host['id'],
            'name' => $host['name'],
            'role' => $host['role'],
            'bio' => $host['bio'],
            'position' => $position,
        ], $this->read('hosts'), array_keys($this->read('hosts'))));

        $series = $this->read('series');
        DB::table('series')->insert(array_map(fn (array $s) => [
            'slug' => $s['slug'],
            'name' => $s['name'],
            'show_id' => $s['showId'],
            'description' => $s['description'],
            'position' => $s['position'],
        ], $series));
        $seriesSlugs = array_column($series, 'slug', 'name');

        // Five and a half thousand episodes, a few hundred rows at a time.
        foreach (array_chunk($this->read('episodes'), 500) as $chunk) {
            DB::table('episodes')->insert(array_map(fn (array $e) => [
                'id' => $e['id'],
                'show_id' => $e['showId'],
                'seq' => $e['seq'],
                'number' => $e['number'] ?? null,
                'title' => $e['title'] ?? null,
                'topics' => isset($e['topics']) ? json_encode($e['topics']) : null,
                'published_at' => $this->datetime($e['publishedAt']),
                'duration_min' => $e['durationMin'],
                'access' => $e['access'],
                'live' => $e['live'] ?? null,
                'edition' => $e['edition'] ?? false,
                'series_slug' => isset($e['series']) ? $seriesSlugs[$e['series']['name']] : null,
                'series_part' => $e['series']['part'] ?? null,
                'series_of' => $e['series']['of'] ?? null,
                'views' => $e['views'],
                'comments_count' => $e['comments'],
            ], $chunk));

            $credits = [];
            foreach ($chunk as $e) {
                foreach ($e['hostIds'] as $position => $hostId) {
                    $credits[] = ['contributor_id' => $hostId, 'episode_id' => $e['id'], 'position' => $position];
                }
            }
            DB::table('contributor_episode')->insert($credits);
        }

        DB::table('articles')->insert(array_map(fn (array $a) => [
            'id' => $a['id'],
            'title' => $a['title'],
            'standfirst' => $a['standfirst'],
            'author_id' => $a['authorId'],
            'category' => $a['category'],
            'published_at' => $this->datetime($a['publishedAt']),
            'read_min' => $a['readMin'],
            'views' => $a['views'],
            'comments_count' => $a['comments'],
            'likes' => $a['likes'],
            'dislikes' => $a['dislikes'],
            // A bulk insert skips the model, so the score is worked out here.
            'controversy' => Article::controversyOf($a['likes'], $a['dislikes']),
            'body' => json_encode($a['body']),
            'reading_list' => json_encode($a['readingList']),
            'watch_next_id' => $a['watchNextId'],
        ], $this->read('articles')));

        $live = $this->read('live');
        DB::table('live_events')->insert([
            'show_id' => $live['showId'],
            'number' => $live['number'],
            'title' => $live['title'],
            'host_ids' => json_encode($live['hostIds']),
            'viewers' => $live['viewers'],
            'start_hour' => $live['startHour'],
        ]);
    }

    private function read(string $name): array
    {
        return json_decode(file_get_contents(database_path("seed/{$name}.json")), true, flags: JSON_THROW_ON_ERROR);
    }

    /** "2026-10-19T12:00:00.000Z" as the database stores it, in UTC. */
    private function datetime(string $iso): string
    {
        return gmdate('Y-m-d H:i:s', strtotime($iso));
    }
}
