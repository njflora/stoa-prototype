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
        $feed = simplexml_load_string($body, options: LIBXML_NOCDATA);
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
