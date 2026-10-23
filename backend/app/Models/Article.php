<?php

namespace App\Models;

use App\Catalogue\Catalogue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Scout\Searchable;

class Article extends Model
{
    use Searchable;

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    // Filled by the seeder, never from a request: nothing is mass-assignable.
    protected $guarded = ['*'];

    protected function casts(): array
    {
        return [
            'body' => 'array',
            'reading_list' => 'array',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Votes change the score, so it is worked out again on every save.
        static::saving(function (Article $article) {
            $article->controversy = self::controversyOf($article->likes, $article->dislikes);
        });
    }

    /**
     * Many votes, split close to evenly, scores high. The same score as
     * comment sections use (src/composables/useVotes.ts in the site).
     */
    public static function controversyOf(int $likes, int $dislikes): float
    {
        if ($likes === 0 || $dislikes === 0) {
            return 0;
        }

        return ($likes + $dislikes) ** (min($likes, $dislikes) / max($likes, $dislikes));
    }

    /**
     * @return BelongsTo<Contributor, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Contributor::class, 'author_id');
    }

    /**
     * @return BelongsTo<Episode, $this>
     */
    public function watchNext(): BelongsTo
    {
        return $this->belongsTo(Episode::class, 'watch_next_id');
    }

    /** What search indexes: the category stands in for a show, the author for hosts. */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'show' => $this->category,
            'hosts' => $this->author->name ?? '',
            'text' => $this->standfirst,
            'published_ts' => $this->published_at->getTimestamp(),
            'category' => $this->category,
            'hostIds' => [$this->author_id],
        ];
    }

    /** What a list of articles shows. */
    public function toCard(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'standfirst' => $this->standfirst,
            'authorId' => $this->author_id,
            'category' => $this->category,
            'publishedAt' => Catalogue::iso($this->published_at),
            'readMin' => $this->read_min,
            'views' => $this->views,
            'comments' => $this->comments_count,
            'likes' => $this->likes,
            'dislikes' => $this->dislikes,
        ];
    }

    /** The full article: its card, the body, the reading list and an episode to watch next. */
    public function toDetail(): array
    {
        return [
            ...$this->toCard(),
            'body' => $this->body,
            'readingList' => $this->reading_list,
            'watchNext' => $this->watchNext->load(Episode::CARD_RELATIONS)->toCard(),
        ];
    }
}
