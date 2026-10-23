<?php

namespace App\Sources;

use RuntimeException;

/**
 * Reads one platform's list of uploads and turns it into FeedItems. One
 * adapter per platform: each knows only its platform's format. The sync
 * (SyncPlatform) and the matcher (EpisodeMatcher) are the same for all.
 *
 * With $fixtures, an adapter reads a recorded sample feed from
 * tests/fixtures/feeds instead of the platform. The live feeds are not
 * wired up: which public feed or API each platform offers is listed as
 * "to verify" in the docs (CONSOLIDATION.md).
 */
abstract class SourceAdapter
{
    /** "rumble", "odysee", "bitchute" or "vod". */
    abstract public function platform(): string;

    /** @return FeedItem[] */
    abstract protected function parse(string $body): array;

    /** @return FeedItem[] */
    public function fetch(bool $fixtures): array
    {
        if (! $fixtures) {
            throw new RuntimeException("The live {$this->platform()} feed is not connected yet. Run with --fixtures.");
        }

        $body = file_get_contents($this->fixturePath());
        if ($body === false) {
            throw new RuntimeException("Cannot read the {$this->platform()} sample feed at {$this->fixturePath()}.");
        }

        return $this->parse($body);
    }

    protected function fixturePath(): string
    {
        return config('stoa.fixtures_path')."/{$this->platform()}.json";
    }

    /** @return array<string, class-string<SourceAdapter>> */
    public static function all(): array
    {
        return [
            'rumble' => RumbleAdapter::class,
            'odysee' => OdyseeAdapter::class,
            'bitchute' => BitChuteAdapter::class,
            'vod' => VodAdapter::class,
        ];
    }
}
