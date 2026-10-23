<?php

namespace Tests\Unit;

use App\Sources\FeedItem;
use App\Sources\SourceAdapter;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * Each platform's adapter reads its recorded sample feed
 * (tests/fixtures/feeds) into feed items the matcher can use. Embed
 * addresses come from outside, so each must be HTTPS on that platform's
 * own host.
 */
class SourceAdaptersTest extends TestCase
{
    private const HOSTS = [
        'rumble' => 'rumble.com',
        'odysee' => 'odysee.com',
        'bitchute' => 'www.bitchute.com',
    ];

    /**
     * @return array<string, array{string}>
     */
    public static function platforms(): array
    {
        return ['rumble' => ['rumble'], 'odysee' => ['odysee'], 'bitchute' => ['bitchute'], 'vod' => ['vod']];
    }

    public function test_every_platform_has_a_test(): void
    {
        $this->assertSame(array_keys(self::platforms()), array_keys(SourceAdapter::all()));
    }

    #[DataProvider('platforms')]
    public function test_the_sample_feed_reads_as_feed_items(string $platform): void
    {
        $adapter = app(SourceAdapter::all()[$platform]);
        $items = $adapter->fetch(fixtures: true);

        $this->assertNotEmpty($items);
        $this->assertContainsOnlyInstancesOf(FeedItem::class, $items);
        foreach ($items as $item) {
            $this->assertNotSame('', $item->externalId);
            $this->assertNotSame('', $item->title);
            $this->assertIsString($item->embedUrl);
            if (isset(self::HOSTS[$platform])) {
                // An outside platform: HTTPS, on that platform's own host.
                $this->assertSame('https', parse_url($item->embedUrl, PHP_URL_SCHEME));
                $this->assertSame(self::HOSTS[$platform], parse_url($item->embedUrl, PHP_URL_HOST));
            } else {
                // The site's own video: a file on the site, named by episode.
                $this->assertNull(parse_url($item->embedUrl, PHP_URL_HOST));
                $this->assertNotNull($item->episodeId);
            }
        }
    }
}
