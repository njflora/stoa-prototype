<?php

namespace App\Jobs;

use App\Catalogue\Catalogue;
use App\Models\EpisodeSource;
use App\Models\IngestRun;
use App\Sources\EpisodeMatcher;
use App\Sources\SourceAdapter;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

/**
 * Syncs one platform: reads its feed, matches each upload to an episode, and
 * links it (episode_sources). Uploads that are not episodes, such as clips,
 * are counted and listed in the run's notes. Every run is recorded
 * (ingest_runs), so the content desk can show what happened and when.
 * Queued, and scheduled hourly (routes/console.php).
 */
class SyncPlatform implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $platform,
        public bool $fixtures = false,
    ) {}

    public function handle(EpisodeMatcher $matcher, Catalogue $catalogue): IngestRun
    {
        $run = IngestRun::create([
            'platform' => $this->platform,
            'fixtures' => $this->fixtures,
            'status' => 'running',
            'started_at' => $catalogue->postingTime(),
        ]);

        try {
            $adapter = app(SourceAdapter::all()[$this->platform]);
            $items = $adapter->fetch($this->fixtures);
            $counts = ['fetched' => count($items), 'matched' => 0, 'linked' => 0, 'unmatched' => 0];
            $unmatched = [];

            foreach ($items as $item) {
                $episode = $matcher->match($item);
                if (! $episode) {
                    $counts['unmatched']++;
                    $unmatched[] = $item->title;

                    continue;
                }
                $counts['matched']++;

                $source = EpisodeSource::firstOrNew(['episode_id' => $episode->id, 'platform' => $this->platform]);
                $changed = $source->status !== 'linked' || $source->external_id !== $item->externalId;
                $source->fill([
                    'status' => 'linked',
                    'external_id' => $item->externalId,
                    'embed_url' => $item->embedUrl,
                    'synced_at' => $catalogue->postingTime(),
                ])->save();
                if ($changed) {
                    $counts['linked']++;
                }
            }

            $run->update([...$counts, 'status' => 'ok', 'notes' => array_slice($unmatched, 0, 10), 'finished_at' => $catalogue->postingTime()]);
        } catch (Throwable $error) {
            $run->update(['status' => 'failed', 'notes' => [$error->getMessage()], 'finished_at' => $catalogue->postingTime()]);
        }

        return $run;
    }
}
