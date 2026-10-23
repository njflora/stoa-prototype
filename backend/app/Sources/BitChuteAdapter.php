<?php

namespace App\Sources;

use Carbon\CarbonImmutable;
use RuntimeException;

/** BitChute: the channel's RSS feed. */
class BitChuteAdapter extends SourceAdapter
{
    public function platform(): string
    {
        return 'bitchute';
    }

    protected function fixturePath(): string
    {
        return config('stoa.fixtures_path').'/bitchute.xml';
    }

    protected function parse(string $body): array
    {
        // An external feed: a broken one fails the sync run with a clear note.
        // The parser collects its errors quietly, rather than raising PHP
        // warnings, and never fetches anything over the network.
        $quiet = libxml_use_internal_errors(true);
        try {
            $feed = simplexml_load_string($body, options: LIBXML_NOCDATA | LIBXML_NONET);
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($quiet);
        }
        if ($feed === false) {
            throw new RuntimeException('The BitChute feed is not valid XML.');
        }
        $items = [];
        foreach ($feed->channel->item as $item) {
            $id = (string) $item->guid;
            $items[] = new FeedItem(
                externalId: $id,
                title: (string) $item->title,
                publishedAt: CarbonImmutable::parse((string) $item->pubDate),
                embedUrl: "https://www.bitchute.com/embed/{$id}/",
            );
        }

        return $items;
    }
}
