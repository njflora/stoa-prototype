<?php

namespace App\Console\Commands;

use App\Jobs\SyncPlatform;
use App\Sources\SourceAdapter;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('stoa:sync {platform? : rumble, odysee, bitchute or vod (default: all)} {--fixtures : Read the recorded sample feeds in tests/fixtures/feeds}')]
#[Description('Sync episode links from the video platforms')]
class SyncPlatforms extends Command
{
    public function handle(): int
    {
        $platforms = $this->argument('platform') ? [$this->argument('platform')] : array_keys(SourceAdapter::all());
        // Any failed run makes the command fail, so the scheduler and monitoring notice.
        $failed = false;
        foreach ($platforms as $platform) {
            if (! array_key_exists($platform, SourceAdapter::all())) {
                $this->error("Unknown platform: {$platform}");

                return self::FAILURE;
            }
            // Run now, here, rather than on the queue, so the result can be shown.
            $run = app()->call([new SyncPlatform($platform, (bool) $this->option('fixtures')), 'handle']);
            $this->line(sprintf(
                '%-9s %-6s fetched %3d, matched %3d, newly linked %3d, unmatched %d',
                $platform, $run->status, $run->fetched, $run->matched, $run->linked, $run->unmatched,
            ));
            if ($run->status === 'failed') {
                $this->error("{$platform}: ".implode(' ', $run->notes ?? []));
                $failed = true;
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
