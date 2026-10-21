<?php

namespace App\Sources;

use Carbon\CarbonImmutable;

/** Rumble: a JSON list of the channel's videos. The real API's shape is to verify. */
class RumbleAdapter extends SourceAdapter
{
    public function platform(): string
    {
        return 'rumble';
    }

    protected function parse(string $body): array
    {
        return array_map(fn (array $video) => new FeedItem(
            externalId: $video['id'],
            title: $video['title'],
            publishedAt: CarbonImmutable::parse($video['published_at']),
            embedUrl: $video['embed_url'] ?? "https://rumble.com/embed/{$video['id']}/",
        ), json_decode($body, true, flags: JSON_THROW_ON_ERROR)['videos']);
    }
}
