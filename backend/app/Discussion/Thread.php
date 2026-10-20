<?php

namespace App\Discussion;

use App\Models\Article;
use App\Models\Episode;

/**
 * A place where people talk: an episode's comments, an article's, the live
 * show's, or a community forum. Each one is either open (any account may
 * post, anyone may read) or members only. The rules live in config/stoa.php.
 */
final class Thread
{
    private function __construct(
        public readonly string $type,
        public readonly string $id,
        public readonly bool $open,
    ) {}

    /** The thread for "episode", "article", "live" or "forum" and an id, or null if there is none. */
    public static function find(string $type, string $id): ?self
    {
        return match ($type) {
            'episode' => ($showId = Episode::whereKey($id)->value('show_id'))
                ? new self($type, $id, in_array($showId, config('stoa.open_shows'), true))
                : null,
            'article' => Article::whereKey($id)->exists() ? new self($type, $id, true) : null,
            'live' => $id === 'live-show' ? new self($type, $id, true) : null,
            'forum' => array_key_exists($id, config('stoa.forums'))
                ? new self($type, $id, config("stoa.forums.{$id}") === 'all')
                : null,
            default => null,
        };
    }

    /** An episode's thread, when its show is already known (no query). */
    public static function forEpisode(string $episodeId, string $showId): self
    {
        return new self('episode', $episodeId, in_array($showId, config('stoa.open_shows'), true));
    }

    /** How it is stored: "episode:chronos-12". */
    public function key(): string
    {
        return "{$this->type}:{$this->id}";
    }
}
