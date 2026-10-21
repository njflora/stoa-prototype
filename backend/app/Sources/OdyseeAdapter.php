<?php

namespace App\Sources;

use Carbon\CarbonImmutable;

/** Odysee: the public API's claim_search answer for the channel. Release times are Unix seconds. */
class OdyseeAdapter extends SourceAdapter
{
    public function platform(): string
    {
        return 'odysee';
    }

    protected function parse(string $body): array
    {
        return array_map(fn (array $claim) => new FeedItem(
            externalId: "{$claim['name']}:{$claim['claim_id']}",
            title: $claim['value']['title'],
            publishedAt: CarbonImmutable::createFromTimestampUTC((int) $claim['value']['release_time']),
            embedUrl: "https://odysee.com/$/embed/@stoa:0/{$claim['name']}:{$claim['claim_id'][0]}",
        ), json_decode($body, true, flags: JSON_THROW_ON_ERROR)['result']['items']);
    }
}
