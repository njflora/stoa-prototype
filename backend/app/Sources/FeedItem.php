<?php

namespace App\Sources;

use Carbon\CarbonImmutable;

/** One upload in a platform's feed, in the same shape whichever platform it came from. */
final class FeedItem
{
    public function __construct(
        public readonly string $externalId,
        public readonly string $title,
        public readonly CarbonImmutable $publishedAt,
        public readonly ?string $embedUrl = null,
        /** The site's own storage names files by episode ("chronos/121"), so VOD needs no guessing. */
        public readonly ?string $episodeId = null,
    ) {}
}
