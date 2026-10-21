<?php

namespace App\Sources;

use App\Models\Episode;
use App\Models\Show;
use Illuminate\Support\Str;

/**
 * Finds the episode a platform upload belongs to. Platforms change titles in
 * small ways (capitals, "|" or "-", a channel name on the end), so titles are
 * compared normalised, and only against episodes published within 12 hours
 * of the upload. Daily editions have no title of their own, so they match by
 * show name and date. The closest in time wins.
 */
class EpisodeMatcher
{
    private const WINDOW_HOURS = 12;

    /** @var array<string, string> show id => normalised name */
    private array $showNames;

    public function __construct()
    {
        $this->showNames = Show::pluck('name', 'id')->map(fn (string $name) => self::normalise($name))->all();
    }

    public function match(FeedItem $item): ?Episode
    {
        if ($item->episodeId) {
            return Episode::find($item->episodeId);
        }

        $title = self::normalise($item->title);
        $candidates = Episode::whereBetween('published_at', [
            $item->publishedAt->subHours(self::WINDOW_HOURS),
            $item->publishedAt->addHours(self::WINDOW_HOURS),
        ])->get();

        return $candidates
            ->filter(fn (Episode $e) => $e->title
                ? self::normalise($e->title) === $title
                : $e->edition && str_starts_with($title, $this->showNames[$e->show_id] ?? '?')
                    && str_contains($title, strtolower($e->published_at->format('j M Y'))))
            ->sortBy(fn (Episode $e) => abs($e->published_at->diffInSeconds($item->publishedAt)))
            ->first();
    }

    /** "CHRONOS #280 - AGINCOURT - Stoa" and "Chronos #280 | Agincourt" become "chronos 280 agincourt". */
    public static function normalise(string $title): string
    {
        $plain = Str::of($title)->ascii()->lower()->replace('&', ' and ')->replaceMatches('/[^a-z0-9]+/', ' ')->squish();

        // The channel's name some platforms add on the end.
        return (string) $plain->replaceMatches('/ stoa$/', '');
    }
}
