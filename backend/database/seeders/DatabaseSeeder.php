<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        $this->seedAccounts();
        $this->seedDiscussion();

        $live = $this->read('live');
        DB::table('live_events')->insert([
            'show_id' => $live['showId'],
            'number' => $live['number'],
            'title' => $live['title'],
            'host_ids' => json_encode($live['hostIds']),
            'viewers' => $live['viewers'],
            'start_hour' => $live['startHour'],
            'sources' => json_encode($live['sources']),
        ]);

        // The last hourly sync before the snapshot, 20 minutes earlier, read
        // from the sample feeds: nothing new to link, and three clips that
        // are not episodes on each platform.
        $lastSync = gmdate('Y-m-d H:i:s', strtotime($meta['generatedAt']) - 20 * 60);
        DB::table('ingest_runs')->insert(array_map(fn (string $platform) => [
            'platform' => $platform,
            'fixtures' => true,
            'status' => 'ok',
            'fetched' => $platform === 'vod' ? 12 : 15,
            'matched' => 12,
            'linked' => 0,
            'unmatched' => $platform === 'vod' ? 0 : 3,
            'notes' => json_encode($platform === 'vod' ? [] : ['Clip: Tom on the budget', 'Highlights of the week', 'Behind the scenes at Stoa']),
            'started_at' => $lastSync,
            'finished_at' => $lastSync,
        ], ['rumble', 'odysee', 'bitchute', 'vod']));

        // Where each episode is published: one row per episode and platform.
        foreach (array_chunk($this->read('sources'), 1000) as $chunk) {
            DB::table('episode_sources')->insert(array_map(fn (array $s) => [
                'episode_id' => $s['episodeId'],
                'platform' => $s['platform'],
                'status' => $s['status'],
                'external_id' => $s['externalId'] ?? null,
                'embed_url' => $s['embedUrl'] ?? null,
                'synced_at' => $this->datetime($s['syncedAt']),
            ], $chunk));
        }

        $this->index();
    }

    /**
     * Name => user id, for the people who comment.
     *
     * @var array<string, int>
     */
    private array $userIds = [];

    /**
     * The demo panel's three accounts, and an account for each invented
     * commenter. Nobody signs in with a password: the demo sign-in picks an
     * account, and every password is a long random string nobody knows.
     */
    private function seedAccounts(): void
    {
        $password = Hash::make(Str::random(64));
        $accounts = [
            ['name' => 'chris_m', 'email' => 'demo-free@stoa.test', 'tier' => null, 'is_staff' => false],
            ['name' => 'chris_m', 'email' => 'demo-member@stoa.test', 'tier' => 'gold', 'is_staff' => false],
            ['name' => 'stoa_desk', 'email' => 'demo-staff@stoa.test', 'tier' => null, 'is_staff' => true],
        ];
        $commenters = [];
        $collect = function (array $comments) use (&$collect, &$commenters) {
            foreach ($comments as $c) {
                $commenters[$c['user']] = $c['tier'];
                $collect($c['replies']);
            }
        };
        foreach ($this->read('comments') as $thread) {
            $collect($thread['comments']);
        }
        foreach ($commenters as $name => $tier) {
            $accounts[] = [
                'name' => $name,
                'email' => Str::slug($name).'@community.stoa.test',
                'tier' => in_array($tier, ['bronze', 'silver', 'gold'], true) ? $tier : null,
                'is_staff' => $tier === 'staff',
            ];
        }
        DB::table('users')->insert(array_map(fn (array $a) => [...$a, 'password' => $password, 'created_at' => now(), 'updated_at' => now()], $accounts));
        $this->userIds = DB::table('users')->where('email', 'like', '%@community.stoa.test')->pluck('id', 'name')->all();
    }

    /** Comments (replies one level deep) and reading lists. */
    private function seedDiscussion(): void
    {
        $rows = [];
        $id = 0;
        foreach ($this->read('comments') as $thread) {
            foreach ($thread['comments'] as $c) {
                $parentId = ++$id;
                $rows[] = $this->commentRow($parentId, $thread['thread'], null, $c);
                foreach ($c['replies'] as $reply) {
                    $rows[] = $this->commentRow(++$id, $thread['thread'], $parentId, $reply);
                }
            }
        }
        foreach (array_chunk($rows, 1000) as $chunk) {
            DB::table('comments')->insert($chunk);
        }

        $items = [];
        foreach ($this->read('reading-lists') as $list) {
            foreach ($list['items'] as $position => $item) {
                $items[] = [
                    'list' => $list['list'],
                    'position' => $position,
                    'type' => $item['type'],
                    'title' => $item['title'],
                    'source' => $item['source'],
                    'year' => $item['year'],
                    'at' => $item['at'] ?? null,
                    'to' => $item['to'] ?? null,
                ];
            }
        }
        foreach (array_chunk($items, 1000) as $chunk) {
            DB::table('reading_list_items')->insert($chunk);
        }
    }

    /**
     * @param  array<string, mixed>  $c
     * @return array<string, mixed>
     */
    private function commentRow(int $id, string $thread, ?int $parentId, array $c): array
    {
        return [
            'id' => $id,
            'thread' => $thread,
            'parent_id' => $parentId,
            'user_id' => $this->userIds[$c['user']],
            'body' => $c['text'],
            'likes' => $c['likes'],
            'dislikes' => $c['dislikes'],
            'posted_at' => $this->datetime($c['postedAt']),
        ];
    }

    /** Rebuild the search index, when search runs in Meilisearch (not in tests). */
    private function index(): void
    {
        if (config('scout.driver') === 'meilisearch') {
            $this->command->call('stoa:index');
        }
    }

    /**
     * @return array<mixed>
     */
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
