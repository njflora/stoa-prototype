<?php

namespace App\Sources;

use Carbon\CarbonImmutable;

/** The site's own video storage: files are named by episode, so each one matches exactly. */
class VodAdapter extends SourceAdapter
{
    public function platform(): string
    {
        return 'vod';
    }

    protected function parse(string $body): array
    {
        return array_map(function (array $asset) {
            [$showId, $seq] = explode('/', $asset['path']);

            return new FeedItem(
                externalId: $asset['path'],
                title: $asset['path'],
                publishedAt: CarbonImmutable::parse($asset['uploaded_at']),
                embedUrl: $asset['file'],
                episodeId: "{$showId}-{$seq}",
            );
        }, json_decode($body, true, flags: JSON_THROW_ON_ERROR)['assets']);
    }
}
